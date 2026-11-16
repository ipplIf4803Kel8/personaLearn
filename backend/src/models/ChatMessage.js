import pool from '../config/db.js'

// Satu pesan obrolan (dari pelajar atau Sinau Bot). lessonId null berarti obrolan umum.
export class ChatMessage {
  #id
  #userId
  #lessonId
  #sender
  #content
  #createdAt

  constructor({ id, userId, lessonId = null, sender, content, createdAt }) {
    this.#id = id
    this.#userId = userId
    this.#lessonId = lessonId
    this.sender = sender
    this.content = content
    this.#createdAt = createdAt
  }

  get id() { return this.#id }
  get userId() { return this.#userId }
  get lessonId() { return this.#lessonId }
  get createdAt() { return this.#createdAt }
  get sender() { return this.#sender }
  get content() { return this.#content }

  set sender(value) {
    if (!['user', 'bot'].includes(value)) throw new Error('Pengirim harus user atau bot')
    this.#sender = value
  }

  set content(value) {
    if (typeof value !== 'string' || !value.trim()) throw new Error('Isi pesan tidak boleh kosong')
    this.#content = value
  }

  toJSON() {
    return {
      id: this.#id,
      lessonId: this.#lessonId,
      sender: this.#sender,
      content: this.#content,
      createdAt: this.#createdAt,
    }
  }

  static fromRow(r) {
    return new ChatMessage({
      id: r.id,
      userId: r.user_id,
      lessonId: r.lesson_id,
      sender: r.sender,
      content: r.content,
      createdAt: r.created_at,
    })
  }

  static async create({ userId, lessonId = null, sender, content }) {
    const msg = new ChatMessage({ userId, lessonId, sender, content })
    const { rows } = await pool.query(
      `INSERT INTO chat_messages (user_id, lesson_id, sender, content) VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, lesson_id, sender, content, created_at`,
      [userId, lessonId, msg.sender, msg.content],
    )
    return ChatMessage.fromRow(rows[0])
  }

  // Pesan terbaru lebih dulu; before = id pesan, hanya ambil yang lebih lama.
  static async listByUser(userId, { lessonId = null, limit = 20, before = null } = {}) {
    const { rows } = await pool.query(
      `SELECT id, user_id, lesson_id, sender, content, created_at FROM chat_messages
       WHERE user_id = $1 AND lesson_id IS NOT DISTINCT FROM $2 AND ($3::int IS NULL OR id < $3)
       ORDER BY id DESC LIMIT $4`,
      [userId, lessonId, before, limit],
    )
    return rows.map(ChatMessage.fromRow)
  }
}
