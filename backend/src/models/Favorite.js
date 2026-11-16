import pool from '../config/db.js'

export class Favorite {
  #userId
  #courseId

  constructor({ userId, courseId }) {
    this.#userId = userId
    this.#courseId = courseId
  }

  get userId() {
    return this.#userId
  }
  get courseId() {
    return this.#courseId
  }

  // Idempotent: menambah favorit yang sudah ada tidak error.
  static async add(userId, courseId) {
    await pool.query('INSERT INTO favorites (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, courseId])
    return new Favorite({ userId, courseId })
  }

  // Mengembalikan true jika ada baris yang terhapus.
  static async remove(userId, courseId) {
    const { rowCount } = await pool.query('DELETE FROM favorites WHERE user_id = $1 AND course_id = $2', [userId, courseId])
    return rowCount > 0
  }
}
