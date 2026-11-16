import pool from '../config/db.js'
import { toCamel } from '../utils/camelCase.js'

// Pendaftaran pelajar ke sebuah kelas. Progres tidak disimpan di sini; lihat view enrollment_progress.
export class Enrollment {
  #id
  #userId
  #courseId
  #enrolledAt
  #completedAt

  constructor({ id, userId, courseId, enrolledAt = null, completedAt = null }) {
    this.#id = id
    this.#userId = userId
    this.#courseId = courseId
    this.#enrolledAt = enrolledAt
    this.#completedAt = completedAt
  }

  get id() {
    return this.#id
  }
  get userId() {
    return this.#userId
  }
  get courseId() {
    return this.#courseId
  }
  get enrolledAt() {
    return this.#enrolledAt
  }
  get completedAt() {
    return this.#completedAt
  }
  set completedAt(value) {
    this.#completedAt = value
  }

  get isCompleted() {
    return this.#completedAt !== null
  }

  toJSON() {
    return {
      id: this.#id,
      userId: this.#userId,
      courseId: this.#courseId,
      enrolledAt: this.#enrolledAt,
      completedAt: this.#completedAt,
    }
  }

  static async find(userId, courseId) {
    const { rows } = await pool.query('SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, courseId])
    return rows[0] ? new Enrollment(toCamel(rows[0])) : null
  }

  // Mengembalikan null jika pelajar sudah terdaftar.
  static async create(userId, courseId) {
    const { rows } = await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [userId, courseId]
    )
    return rows[0] ? new Enrollment(toCamel(rows[0])) : null
  }

  static async exists(userId, courseId) {
    const { rowCount } = await pool.query('SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, courseId])
    return rowCount > 0
  }
}
