import pool from '../config/db.js'
import { toCamel } from '../utils/camelCase.js'

// Tag kelas disimpan di course_tags; di API tetap berupa array. `type` selalu konstanta dari kode.
export const tagsOf = (type) =>
  `ARRAY(SELECT tag_value FROM course_tags t WHERE t.course_id = c.id AND t.tag_type = '${type}' ORDER BY tag_value)`

// Kolom yang boleh dipakai untuk mengurutkan; nilainya aman disisipkan ke SQL.
export const SORTS = {
  popular: 'students_count DESC, id',
  rating: 'rating DESC NULLS LAST, id',
  newest: 'id DESC',
}

export class Course {
  #id
  #categoryId
  #categoryName
  #title
  #description
  #level
  #thumbnailUrl
  #extra

  // `extra` berisi nilai turunan: rating, studentsCount, lessonsCount, tag, isFavorite, isEnrolled, dst.
  constructor({ id, categoryId, categoryName, title, description, level, thumbnailUrl, ...extra }) {
    this.#id = id
    this.#categoryId = categoryId
    this.#categoryName = categoryName
    this.#title = title
    this.#description = description
    this.#level = level
    this.#thumbnailUrl = thumbnailUrl
    this.#extra = extra
  }

  get id() {
    return this.#id
  }
  get categoryId() {
    return this.#categoryId
  }
  get categoryName() {
    return this.#categoryName
  }
  get title() {
    return this.#title
  }
  set title(value) {
    this.#title = value
  }
  get description() {
    return this.#description
  }
  set description(value) {
    this.#description = value
  }
  get level() {
    return this.#level
  }
  get thumbnailUrl() {
    return this.#thumbnailUrl
  }
  get extra() {
    return this.#extra
  }

  toJSON() {
    return {
      id: this.#id,
      categoryId: this.#categoryId,
      categoryName: this.#categoryName,
      title: this.#title,
      description: this.#description,
      level: this.#level,
      thumbnailUrl: this.#thumbnailUrl,
      ...this.#extra,
    }
  }

  // filter: { id, q, categoryId, level, minRating, maxDurationMinutes, favoritesOnly, notEnrolled, sort, limit, offset }
  // Semua nilai sudah divalidasi oleh CourseService. Hanya kelas terbit yang dikembalikan.
  static async search(userId, filter = {}) {
    const sort = SORTS[filter.sort] ?? 'id'
    const { rows } = await pool.query(
      `SELECT *, COUNT(*) OVER()::int AS total FROM (
         SELECT c.id, c.category_id, cat.name AS category_name, c.title, c.description, c.level,
           c.thumbnail_url, ${tagsOf('vark')} AS vark_tags, ${tagsOf('personality')} AS personality_tags,
           s.rating_avg AS rating, s.ratings_count, s.students_count,
           (SELECT COUNT(*)::int FROM lessons WHERE course_id = c.id) AS lessons_count,
           (SELECT COALESCE(SUM(duration_seconds), 0)::int FROM lessons WHERE course_id = c.id) AS total_duration_seconds,
           EXISTS (SELECT 1 FROM favorites f WHERE f.course_id = c.id AND f.user_id = $1) AS is_favorite,
           EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.id AND e.user_id = $1) AS is_enrolled
         FROM courses c JOIN categories cat ON cat.id = c.category_id
         JOIN course_stats s ON s.course_id = c.id
         WHERE c.is_published
       ) x
       WHERE ($2::text IS NULL OR title ILIKE '%' || $2 || '%' ESCAPE '\\')
         AND ($3::int IS NULL OR category_id = $3)
         AND ($4::text IS NULL OR level = $4)
         AND ($5::float IS NULL OR rating >= $5)
         AND ($6::int IS NULL OR total_duration_seconds <= $6 * 60)
         AND (NOT $7::boolean OR is_favorite)
         AND lessons_count > 0
         AND ($8::int IS NULL OR id = $8)
         AND (NOT $9::boolean OR NOT is_enrolled)
       ORDER BY ${sort}
       LIMIT $10::int OFFSET $11::int`,
      [
        userId,
        filter.q ?? null,
        filter.categoryId ?? null,
        filter.level ?? null,
        filter.minRating ?? null,
        filter.maxDurationMinutes ?? null,
        Boolean(filter.favoritesOnly),
        filter.id ?? null,
        Boolean(filter.notEnrolled),
        filter.limit ?? null,
        filter.offset ?? 0,
      ]
    )
    return { courses: rows.map(({ total, ...row }) => new Course(toCamel(row))), total: rows[0]?.total ?? 0 }
  }

  static async isPublished(id) {
    const { rowCount } = await pool.query('SELECT 1 FROM courses WHERE id = $1 AND is_published', [id])
    return rowCount > 0
  }

  // Kategori dari kelas yang pernah diambil pelajar.
  static async takenCategoryIds(userId) {
    const { rows } = await pool.query(
      'SELECT DISTINCT c.category_id FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE e.user_id = $1',
      [userId]
    )
    return rows.map((r) => r.category_id)
  }

  static async preferenceOf(userId) {
    const { rows } = await pool.query('SELECT mbti_type, vark_style FROM learning_preferences WHERE user_id = $1', [userId])
    return rows[0] ? { mbtiType: rows[0].mbti_type, varkStyle: rows[0].vark_style } : null
  }
}
