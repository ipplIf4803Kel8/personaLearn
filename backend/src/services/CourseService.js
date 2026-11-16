import pool from '../config/db.js'
import { toCamel } from '../utils/camelCase.js'
import { Category } from '../models/Category.js'
import { Course, SORTS, tagsOf } from '../models/Course.js'
import { CourseRating } from '../models/CourseRating.js'
import { Enrollment } from '../models/Enrollment.js'
import { Favorite } from '../models/Favorite.js'
import { Lesson } from '../models/Lesson.js'

const fail = (status, message) => Object.assign(new Error(message), { status })

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const COURSE_FIELDS = ['categoryId', 'title', 'description', 'level', 'thumbnailUrl', 'isPublished']
const TAG_TYPES = { varkTags: 'vark', personalityTags: 'personality' }
const snake = (s) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)

// Query string selalu berupa string; kosong/undefined dianggap "tidak difilter".
const present = (v) => v !== undefined && v !== null && v !== ''
function int(v, name) {
  if (!present(v)) return null
  const n = Number(v)
  if (!Number.isInteger(n) || n < 0) throw fail(400, `${name} harus berupa bilangan bulat`)
  return n
}
const likeEscape = (s) => s.replace(/[\\%_]/g, '\\$&')

// Kelas kontrol CourseService (DPPL 3.3): katalog kelas, detail, favorit, pendaftaran, rating,
// dan pengelolaan kelas oleh admin.
export class CourseService {
  async listCategories() {
    return Category.findAll()
  }

  // Memeriksa filter lalu mengubahnya ke bentuk yang dipakai Course.search.
  // filter: { id, q, categoryId, level, minRating, maxDurationMinutes, favoritesOnly, notEnrolled, sort, page, limit }
  #parseFilter(filter) {
    const q = present(filter.q) ? String(filter.q).trim().slice(0, 100) : null
    const minRating = present(filter.minRating) ? Number(filter.minRating) : null
    if (minRating !== null && !(minRating >= 0 && minRating <= 5)) throw fail(400, 'minRating harus 0 sampai 5')
    const level = present(filter.level) ? filter.level : null
    if (level && !LEVELS.includes(level)) throw fail(400, `level harus salah satu dari: ${LEVELS.join(', ')}`)
    if (present(filter.sort) && !SORTS[filter.sort]) throw fail(400, `sort harus salah satu dari: ${Object.keys(SORTS).join(', ')}`)
    const limit = int(filter.limit, 'limit')
    const page = int(filter.page, 'page') || 1
    return {
      id: int(filter.id, 'id'),
      q: q && likeEscape(q),
      categoryId: int(filter.categoryId, 'categoryId'),
      level,
      minRating,
      maxDurationMinutes: int(filter.maxDurationMinutes, 'maxDurationMinutes'),
      favoritesOnly: filter.favoritesOnly === true || filter.favoritesOnly === 'true',
      notEnrolled: filter.notEnrolled === true,
      sort: filter.sort,
      limit,
      offset: limit ? (page - 1) * limit : 0,
    }
  }

  // Daftar kelas terbit dengan metadata halaman. Tanpa limit, semua hasil dikembalikan.
  async list(userId, filter = {}) {
    const parsed = this.#parseFilter(filter)
    const { courses, total } = await Course.search(userId, parsed)
    return { items: courses.map((c) => c.toJSON()), meta: { page: parsed.limit ? parsed.offset / parsed.limit + 1 : 1, limit: parsed.limit ?? total, total } }
  }

  async search(userId, filter = {}) {
    return (await this.list(userId, filter)).items
  }

  async popular(userId, limit = 10) {
    return this.list(userId, { sort: 'popular', limit, page: 1 })
  }

  async getDetail(userId, courseId) {
    const id = int(courseId, 'id')
    const [course] = await this.search(userId, { id })
    if (!course) throw fail(404, 'Kelas tidak ditemukan')
    const [lessons, myRating] = await Promise.all([Lesson.findByCourse(id), CourseRating.find(userId, id)])
    return { ...course, lessons, myRating: myRating?.rating ?? null }
  }

  // Pratinjau tanpa mengambil kelas: hanya pelajaran pertama dari kelas yang terbit.
  async getPreview(courseId) {
    const lesson = await Lesson.findPreview(int(courseId, 'id'))
    if (!lesson) throw fail(404, 'Pratinjau tidak tersedia')
    const { id, title, description, videoUrl, durationSeconds } = lesson.toJSON()
    return { lessonId: id, title, description, videoUrl, durationSeconds }
  }

  async #requirePublished(courseId) {
    const id = int(courseId, 'id')
    if (!(await Course.isPublished(id))) throw fail(404, 'Kelas tidak ditemukan')
    return id
  }

  // Idempotent: mengambil kelas yang sudah diambil tidak error, hanya ditandai alreadyEnrolled.
  async enroll(userId, courseId) {
    const id = await this.#requirePublished(courseId)
    if (!(await pool.query('SELECT 1 FROM lessons WHERE course_id = $1 LIMIT 1', [id])).rowCount) throw fail(422, 'Kelas belum memiliki pelajaran')
    const enrollment = await Enrollment.create(userId, id)
    return { courseId: id, enrolledAt: enrollment?.enrolledAt ?? null, alreadyEnrolled: enrollment === null }
  }

  // Hanya pelajar yang sudah mengambil kelas yang boleh memberi rating; rating kedua menimpa yang pertama.
  async rate(userId, courseId, rating, review = null) {
    const id = await this.#requirePublished(courseId)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw fail(400, 'Rating harus bilangan bulat 1 sampai 5')
    if (!(await Enrollment.exists(userId, id))) throw fail(403, 'Ambil kelas ini dulu sebelum memberi rating')
    await CourseRating.upsert(userId, id, rating, review?.trim() || null)
    const [course] = await this.search(userId, { id })
    return { courseId: id, rating, ratingAvg: course.rating, ratingsCount: course.ratingsCount }
  }

  async addFavorite(userId, courseId) {
    const id = await this.#requirePublished(courseId)
    await Favorite.add(userId, id)
    return { courseId: id, isFavorite: true }
  }

  async removeFavorite(userId, courseId) {
    const id = int(courseId, 'id')
    await Favorite.remove(userId, id)
    return { courseId: id, isFavorite: false }
  }

  async toggleFavorite(userId, courseId) {
    const id = await this.#requirePublished(courseId)
    return (await Favorite.remove(userId, id)) ? { courseId: id, isFavorite: false } : this.addFavorite(userId, id)
  }

  // --- pengelolaan oleh admin ---

  // Daftar untuk admin: semua kelas termasuk draf, lengkap dengan tag, rating, dan jumlah peserta.
  async listAdmin(id = null) {
    const { rows } = await pool.query(
      `SELECT c.*, ${tagsOf('vark')} AS vark_tags, ${tagsOf('personality')} AS personality_tags,
         s.rating_avg AS rating, s.students_count
       FROM courses c JOIN course_stats s ON s.course_id = c.id
       WHERE $1::int IS NULL OR c.id = $1 ORDER BY c.id`,
      [id]
    )
    return rows.map(toCamel)
  }

  async create(data) {
    if (!data.title?.trim() || !present(data.categoryId)) throw fail(400, 'Field wajib diisi: categoryId, title')
    if (data.level !== undefined && !LEVELS.includes(data.level)) throw fail(400, `level harus salah satu dari: ${LEVELS.join(', ')}`)
    const cols = COURSE_FIELDS.filter((f) => data[f] !== undefined)
    return this.#write(data, (db) =>
      db.query(
        `INSERT INTO courses (${cols.map(snake)}) VALUES (${cols.map((_, i) => `$${i + 1}`)}) RETURNING id`,
        cols.map((f) => (f === 'title' ? data.title.trim() : data[f]))
      )
    )
  }

  async update(courseId, data) {
    const id = int(courseId, 'id')
    if (data.title !== undefined && !String(data.title).trim()) throw fail(400, 'title tidak boleh kosong')
    if (data.level !== undefined && !LEVELS.includes(data.level)) throw fail(400, `level harus salah satu dari: ${LEVELS.join(', ')}`)
    const cols = COURSE_FIELDS.filter((f) => data[f] !== undefined)
    if (!cols.length && !Object.keys(TAG_TYPES).some((f) => data[f] !== undefined)) throw fail(400, 'Tidak ada data untuk diubah')
    return this.#write(data, (db) =>
      cols.length
        ? db.query(
            `UPDATE courses SET ${cols.map((f, i) => `${snake(f)} = $${i + 1}`)} WHERE id = $${cols.length + 1} RETURNING id`,
            [...cols.map((f) => data[f]), id]
          )
        : db.query('SELECT id FROM courses WHERE id = $1', [id])
    )
  }

  // Tulis kelas dan ganti tag dalam satu transaksi, lalu kembalikan baris admin lengkap.
  async #write(data, writeCourse) {
    const db = await pool.connect()
    try {
      await db.query('BEGIN')
      const { rows } = await writeCourse(db)
      if (!rows[0]) throw fail(404, 'Kelas tidak ditemukan')
      for (const [field, type] of Object.entries(TAG_TYPES)) {
        if (data[field] === undefined) continue
        if (!Array.isArray(data[field])) throw fail(400, `${field} harus berupa array`)
        await db.query('DELETE FROM course_tags WHERE course_id = $1 AND tag_type = $2', [rows[0].id, type])
        await db.query(
          `INSERT INTO course_tags (course_id, tag_type, tag_value)
           SELECT $1, $2, v FROM unnest($3::text[]) AS v ON CONFLICT DO NOTHING`,
          [rows[0].id, type, data[field].map(String)]
        )
      }
      await db.query('COMMIT')
      return (await this.listAdmin(rows[0].id))[0]
    } catch (err) {
      await db.query('ROLLBACK')
      if (err.code === '23514') throw fail(400, 'Nilai tag tidak valid')
      throw err
    } finally {
      db.release()
    }
  }

  async delete(courseId) {
    const { rowCount } = await pool.query('DELETE FROM courses WHERE id = $1', [int(courseId, 'id')])
    if (!rowCount) throw fail(404, 'Kelas tidak ditemukan')
  }

  async addLesson(courseId, { title, videoUrl = '', durationSeconds = 0, description = '' }) {
    const id = int(courseId, 'id')
    if (!title?.trim()) throw fail(400, 'Field wajib diisi: title')
    const course = await pool.query('SELECT 1 FROM courses WHERE id = $1', [id])
    if (!course.rowCount) throw fail(404, 'Kelas tidak ditemukan')
    const { rows } = await pool.query(
      `INSERT INTO lessons (course_id, title, video_url, duration_seconds, description, position)
       VALUES ($1, $2, $3, $4, $5, COALESCE((SELECT MAX(position) FROM lessons WHERE course_id = $1), 0) + 1)
       RETURNING *`,
      [id, title.trim(), videoUrl, durationSeconds, description]
    )
    return toCamel(rows[0])
  }
}

export const courseService = new CourseService()
