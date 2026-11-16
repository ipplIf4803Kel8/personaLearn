import pool from '../config/db.js'

export class CourseRating {
  #userId
  #courseId
  #rating
  #review

  constructor({ userId, courseId, rating, review = null }) {
    this.#userId = userId
    this.#courseId = courseId
    this.#rating = rating
    this.#review = review
  }

  get userId() {
    return this.#userId
  }
  get courseId() {
    return this.#courseId
  }
  get rating() {
    return this.#rating
  }
  set rating(value) {
    if (!Number.isInteger(value) || value < 1 || value > 5) throw new RangeError('rating harus 1 sampai 5')
    this.#rating = value
  }
  get review() {
    return this.#review
  }
  set review(value) {
    this.#review = value
  }

  toJSON() {
    return { courseId: this.#courseId, rating: this.#rating, review: this.#review }
  }

  static async upsert(userId, courseId, rating, review = null) {
    const { rows } = await pool.query(
      `INSERT INTO course_ratings (user_id, course_id, rating, review) VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, course_id) DO UPDATE SET rating = EXCLUDED.rating, review = EXCLUDED.review
       RETURNING rating, review`,
      [userId, courseId, rating, review]
    )
    return new CourseRating({ userId, courseId, ...rows[0] })
  }

  static async find(userId, courseId) {
    const { rows } = await pool.query('SELECT rating, review FROM course_ratings WHERE user_id = $1 AND course_id = $2', [userId, courseId])
    return rows[0] ? new CourseRating({ userId, courseId, ...rows[0] }) : null
  }
}
