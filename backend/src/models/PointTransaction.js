import pool from '../config/db.js'

// Riwayat poin. Total poin pengguna adalah jumlah semua barisnya.
export class PointTransaction {
  #id
  #userId
  #points
  #source
  #referenceId

  constructor({ id, userId, points, source, referenceId = null }) {
    this.#id = id
    this.#userId = userId
    this.#points = points
    this.#source = source
    this.#referenceId = referenceId
  }

  get id() {
    return this.#id
  }
  get userId() {
    return this.#userId
  }
  get points() {
    return this.#points
  }
  get source() {
    return this.#source
  }
  get referenceId() {
    return this.#referenceId
  }

  static async create({ userId, points, source, referenceId = null }, db = pool) {
    const { rows } = await db.query(
      'INSERT INTO point_transactions (user_id, points, source, reference_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, points, source, referenceId]
    )
    const r = rows[0]
    return new PointTransaction({ id: r.id, userId: r.user_id, points: r.points, source: r.source, referenceId: r.reference_id })
  }

  static async totalFor(userId, db = pool) {
    const { rows } = await db.query('SELECT COALESCE(SUM(points), 0)::int AS total FROM point_transactions WHERE user_id = $1', [userId])
    return rows[0].total
  }
}
