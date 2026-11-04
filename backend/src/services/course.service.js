import pool from '../config/db.js'
import { toCamel } from './crud.service.js'

const fail = (status, message) => Object.assign(new Error(message), { status })

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const SORTS = { popular: 'students_count DESC, id', newest: 'id DESC' }
const CREATE_FIELDS = ['categoryId', 'title', 'description', 'level', 'thumbnailUrl', 'isPublished', 'varkTags', 'personalityTags']

// Query string selalu berupa string; kosong/undefined dianggap "tidak difilter".
const present = (v) => v !== undefined && v !== null && v !== ''
function int(v, name) {
  if (!present(v)) return null
  const n = Number(v)
  if (!Number.isInteger(n) || n < 0) throw fail(400, `${name} harus berupa bilangan bulat`)
  return n
}
const likeEscape = (s) => s.replace(/[\\%_]/g, '\\$&')

// Kelas kontrol CourseService (DPPL 3.3): pencarian kelas, detail, favorit, pendaftaran,
// dan pengelolaan kelas oleh admin.
export class CourseService {
  // filter: { id, q, categoryId, level, minRating, maxDurationMinutes, favoritesOnly, sort }
  // Hanya kelas terpublikasi yang muncul untuk pelajar.
  async search(userId, filter = {}) {
    const q = present(filter.q) ? String(filter.q).trim().slice(0, 100) : null
    const categoryId = int(filter.categoryId, 'categoryId')
    const maxMinutes = int(filter.maxDurationMinutes, 'maxDurationMinutes')
    const minRating = present(filter.minRating) ? Number(filter.minRating) : null
    if (minRating !== null && !(minRating >= 0 && minRating <= 5)) throw fail(400, 'minRating harus 0 sampai 5')
    const level = present(filter.level) ? filter.level : null
    if (level && !LEVELS.includes(level)) throw fail(400, `level harus salah satu dari: ${LEVELS.join(', ')}`)
    const sort = SORTS[filter.sort] ?? 'id'
    if (present(filter.sort) && !SORTS[filter.sort]) throw fail(400, `sort harus salah satu dari: ${Object.keys(SORTS).join(', ')}`)
    const favoritesOnly = filter.favoritesOnly === true || filter.favoritesOnly === 'true'

    // `sort` hanya bisa bernilai salah satu string di SORTS, jadi aman disisipkan ke SQL.
    const { rows } = await pool.query(
      `SELECT * FROM (
         SELECT c.id, c.category_id, cat.name AS category_name, c.title, c.description, c.level,
           c.thumbnail_url, c.vark_tags, c.personality_tags,
           (SELECT ROUND(AVG(rating), 1)::float FROM enrollments WHERE course_id = c.id) AS rating,
           (SELECT COUNT(*)::int FROM enrollments WHERE course_id = c.id) AS students_count,
           (SELECT COUNT(*)::int FROM lessons WHERE course_id = c.id) AS lessons_count,
           (SELECT COALESCE(SUM(duration_seconds), 0)::int FROM lessons WHERE course_id = c.id) AS total_duration_seconds,
           EXISTS (SELECT 1 FROM favorites f WHERE f.course_id = c.id AND f.user_id = $1) AS is_favorite
         FROM courses c JOIN categories cat ON cat.id = c.category_id
         WHERE c.is_published
       ) x
       WHERE ($2::text IS NULL OR title ILIKE '%' || $2 || '%' ESCAPE '\\')
         AND ($3::int IS NULL OR category_id = $3)
         AND ($4::text IS NULL OR level = $4)
         AND ($5::float IS NULL OR rating >= $5)
         AND ($6::int IS NULL OR total_duration_seconds <= $6 * 60)
         AND (NOT $7::boolean OR is_favorite)
         AND ($8::int IS NULL OR id = $8)
       ORDER BY ${sort}`,
      [userId, q && likeEscape(q), categoryId, level, minRating, maxMinutes, favoritesOnly, int(filter.id, 'id')]
    )
    return rows.map(toCamel)
  }

  async getDetail(userId, courseId) {
    const id = int(courseId, 'id')
    const [course] = await this.search(userId, { id })
    if (!course) throw fail(404, 'Kelas tidak ditemukan')
    const [{ rows: lessons }, { rows: enrolled }] = await Promise.all([
      pool.query(
        'SELECT id, title, description, video_url, duration_seconds, position FROM lessons WHERE course_id = $1 ORDER BY position, id',
        [id]
      ),
      pool.query('SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, id]),
    ])
    return { ...course, lessons: lessons.map(toCamel), isEnrolled: enrolled.length > 0 }
  }

  // Idempotent: mengambil kelas yang sudah diambil tidak error, hanya ditandai alreadyEnrolled.
  async enroll(userId, courseId) {
    const id = int(courseId, 'id')
    const published = await pool.query('SELECT 1 FROM courses WHERE id = $1 AND is_published', [id])
    if (!published.rowCount) throw fail(404, 'Kelas tidak ditemukan')
    const { rows } = await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING enrolled_at',
      [userId, id]
    )
    return { courseId: id, enrolledAt: rows[0]?.enrolled_at ?? null, alreadyEnrolled: rows.length === 0 }
  }

  async toggleFavorite(userId, courseId) {
    const id = int(courseId, 'id')
    const published = await pool.query('SELECT 1 FROM courses WHERE id = $1 AND is_published', [id])
    if (!published.rowCount) throw fail(404, 'Kelas tidak ditemukan')
    const removed = await pool.query('DELETE FROM favorites WHERE user_id = $1 AND course_id = $2', [userId, id])
    if (!removed.rowCount) {
      await pool.query('INSERT INTO favorites (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, id])
    }
    return { courseId: id, isFavorite: removed.rowCount === 0 }
  }

  // --- pengelolaan oleh admin ---

  async create(data) {
    if (!data.title?.trim() || !present(data.categoryId)) throw fail(400, 'Field wajib diisi: categoryId, title')
    if (data.level !== undefined && !LEVELS.includes(data.level)) throw fail(400, `level harus salah satu dari: ${LEVELS.join(', ')}`)
    const cols = CREATE_FIELDS.filter((f) => data[f] !== undefined)
    const snake = (s) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
    const { rows } = await pool.query(
      `INSERT INTO courses (${cols.map(snake)}) VALUES (${cols.map((_, i) => `$${i + 1}`)}) RETURNING *`,
      cols.map((f) => (f === 'title' ? data.title.trim() : data[f]))
    )
    return toCamel(rows[0])
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
