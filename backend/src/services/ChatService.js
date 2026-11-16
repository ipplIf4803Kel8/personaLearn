import pool from '../config/db.js'
import { ChatMessage } from '../models/ChatMessage.js'
import { LlmClient } from './LlmClient.js'
import { ChatPromptBuilder, HISTORY_SIZE } from './ChatPromptBuilder.js'
import { FALLBACK_REPLY, REFUSAL_REPLY, filterReply, isExploitAttempt, isMeaningless, sanitizeInput } from './ChatGuard.js'

const fail = (status, message) => Object.assign(new Error(message), { status })

const RATE_WINDOW_MS = 60 * 1000
const RATE_MAX = 10
const dailyLimit = () => Number(process.env.CHAT_DAILY_LIMIT) || 100

// ChatService (DPPL UC #6): obrolan pelajar dengan Sinau Bot.
export class ChatService {
  #llm
  #builder
  #hits = new Map()
  #busy = new Set()

  constructor({ llm = new LlmClient(), builder = new ChatPromptBuilder() } = {}) {
    this.#llm = llm
    this.#builder = builder
  }

  get llm() {
    return this.#llm
  }

  // ponytail: hitungan di memori proses; hilang saat restart dan tidak dibagi antar-instance. Pakai Redis jika di-scale.
  #checkRate(userId) {
    const now = Date.now()
    const hits = (this.#hits.get(userId) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
    if (hits.length >= RATE_MAX) {
      this.#hits.set(userId, hits)
      throw fail(429, 'Terlalu banyak pesan, tunggu sebentar lalu coba lagi')
    }
    hits.push(now)
    this.#hits.set(userId, hits)
    if (this.#hits.size > 5000) for (const [k, v] of this.#hits) if (now - v.at(-1) >= RATE_WINDOW_MS) this.#hits.delete(k)
  }

  // Batas harian dihitung dari pesan pelajar yang tersimpan hari ini (zona waktu server).
  async #checkDaily(userId) {
    const { rows } = await pool.query(
      "SELECT COUNT(*)::int AS n FROM chat_messages WHERE user_id = $1 AND sender = 'user' AND created_at >= date_trunc('day', NOW())",
      [userId],
    )
    if (rows[0].n >= dailyLimit()) throw fail(429, 'Batas obrolan hari ini tercapai, coba lagi besok')
  }

  // Pelajar hanya boleh memakai pelajaran dari kelas terbit yang ia ambil.
  async #findLesson(userId, lessonId) {
    const { rows } = await pool.query(
      `SELECT l.title, l.description, l.position, c.title AS course_title, c.level,
         (SELECT COUNT(*)::int FROM lessons x WHERE x.course_id = c.id) AS total,
         (SELECT progress_percent FROM enrollment_progress ep WHERE ep.user_id = $1 AND ep.course_id = c.id) AS progress
       FROM lessons l
       JOIN courses c ON c.id = l.course_id AND c.is_published
       JOIN enrollments e ON e.course_id = l.course_id AND e.user_id = $1
       WHERE l.id = $2`,
      [userId, lessonId],
    )
    const r = rows[0]
    if (!r) throw fail(403, 'Anda belum mengambil kelas untuk pelajaran ini')
    return { title: r.title, description: r.description, position: r.position, total: r.total, progress: r.progress, courseTitle: r.course_title, level: r.level }
  }

  // Hanya data minimal: nama depan (diambil builder), preferensi belajar, dan kelas terbit yang diambil.
  async #loadProfile(userId) {
    const [u, p, e] = await Promise.all([
      pool.query('SELECT name FROM users WHERE id = $1', [userId]),
      pool.query('SELECT mbti_type, vark_style FROM learning_preferences WHERE user_id = $1', [userId]),
      pool.query(
        `SELECT c.title, c.level, ep.progress_percent AS progress,
           (SELECT l.title FROM lessons l
            WHERE l.course_id = c.id AND NOT EXISTS (SELECT 1 FROM lesson_progress lp WHERE lp.lesson_id = l.id AND lp.user_id = $1 AND lp.completed_at IS NOT NULL)
            ORDER BY l.position, l.id LIMIT 1) AS next_lesson
         FROM enrollments e
         JOIN courses c ON c.id = e.course_id AND c.is_published
         JOIN enrollment_progress ep ON ep.enrollment_id = e.id
         WHERE e.user_id = $1 ORDER BY e.id DESC LIMIT 10`,
        [userId],
      ),
    ])
    return {
      user: { name: u.rows[0]?.name },
      preferences: { mbtiType: p.rows[0]?.mbti_type ?? null, varkStyle: p.rows[0]?.vark_style ?? null },
      enrollments: e.rows.map((r) => ({ title: r.title, level: r.level, progress: r.progress, nextLesson: r.next_lesson })),
    }
  }

  // Urutan hasil dari lama ke baru. before = id pesan; hanya ambil yang lebih lama darinya.
  async history(userId, { lessonId = null, limit = 20, before = null } = {}) {
    if (lessonId) await this.#findLesson(userId, lessonId)
    const rows = await ChatMessage.listByUser(userId, { lessonId, limit: limit + 1, before })
    return { messages: rows.slice(0, limit).reverse(), hasMore: rows.length > limit }
  }

  // Memanggil LLM; kegagalan dikendalikan (balasan cadangan). Log hanya userId, status, dan durasi.
  async #ask(userId, prompt) {
    const started = Date.now()
    try {
      return filterReply(await this.#llm.complete(prompt))
    } catch (err) {
      console.error(`Sinau Bot gagal: user=${userId} status=${err?.status ?? '-'} blocked=${Boolean(err?.blocked)} ${Date.now() - started}ms`)
      return FALLBACK_REPLY
    }
  }

  async #reply(userId, { content, lessonId, lesson }) {
    if (isExploitAttempt(content)) return REFUSAL_REPLY
    const [profile, recent] = await Promise.all([
      this.#loadProfile(userId),
      ChatMessage.listByUser(userId, { lessonId, limit: HISTORY_SIZE }),
    ])
    const history = recent.reverse().map((m) => ({ sender: m.sender, content: m.content }))
    return this.#ask(userId, this.#builder.build({ ...profile, lesson, history, message: content }))
  }

  async send(userId, { content: raw, lessonId = null }) {
    if (this.#busy.has(userId)) throw fail(429, 'Sinau Bot masih menjawab pesanmu sebelumnya, tunggu sebentar')
    this.#busy.add(userId)
    try {
      const content = sanitizeInput(raw)
      if (isMeaningless(content)) throw fail(422, 'Pesan tidak valid, tulis pertanyaan yang jelas')
      this.#checkRate(userId)
      await this.#checkDaily(userId)
      const lesson = lessonId ? await this.#findLesson(userId, lessonId) : null
      const reply = await this.#reply(userId, { content, lessonId, lesson })
      const userMessage = await ChatMessage.create({ userId, lessonId, sender: 'user', content })
      const botMessage = await ChatMessage.create({ userId, lessonId, sender: 'bot', content: reply })
      return { userMessage, botMessage }
    } finally {
      this.#busy.delete(userId)
    }
  }
}

export const chatService = new ChatService()
