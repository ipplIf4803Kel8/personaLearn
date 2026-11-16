import pool from '../config/db.js'

export const MAX_ATTEMPTS = 5
const TTL_MINUTES = 10

export default class PasswordReset {
  #id
  #userId
  #otpHash
  #attempts

  constructor(row) {
    this.#id = row.id
    this.#userId = row.user_id
    this.#otpHash = row.otp_hash
    this.#attempts = row.attempts
  }

  get id() { return this.#id }
  get userId() { return this.#userId }
  get otpHash() { return this.#otpHash }
  get attempts() { return this.#attempts }

  // OTP lama yang belum dipakai dibatalkan, jadi hanya satu kode yang berlaku.
  static async issue(userId, otpHash) {
    await PasswordReset.invalidateAll(userId)
    await pool.query(
      `INSERT INTO password_resets (user_id, otp_hash, expires_at)
       VALUES ($1, $2, NOW() + make_interval(mins => $3))`,
      [userId, otpHash, TTL_MINUTES]
    )
  }

  static async findActive(userId) {
    const { rows } = await pool.query(
      `SELECT * FROM password_resets
       WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [userId]
    )
    return rows[0] ? new PasswordReset(rows[0]) : null
  }

  static async invalidateAll(userId) {
    await pool.query('UPDATE password_resets SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL', [userId])
  }

  // Atomik: false bila batas percobaan sudah habis atau kode sudah dipakai.
  async countAttempt() {
    const { rowCount } = await pool.query(
      'UPDATE password_resets SET attempts = attempts + 1 WHERE id = $1 AND attempts < $2 AND used_at IS NULL',
      [this.#id, MAX_ATTEMPTS]
    )
    return rowCount === 1
  }

  // Sekali pakai: hanya satu pemanggil yang berhasil menandai kode ini terpakai.
  async consume() {
    const { rowCount } = await pool.query(
      'UPDATE password_resets SET used_at = NOW() WHERE id = $1 AND used_at IS NULL',
      [this.#id]
    )
    return rowCount === 1
  }
}
