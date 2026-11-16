import pool from '../config/db.js'

export class UserProfile {
  #id
  #name
  #email
  #phone
  #avatarUrl

  constructor({ id, name, email, phone, avatarUrl }) {
    this.#id = id
    this.#name = name
    this.#email = email
    this.#phone = phone
    this.#avatarUrl = avatarUrl
  }

  get id() { return this.#id }
  get name() { return this.#name }
  set name(value) { this.#name = value.trim() }
  get email() { return this.#email }
  set email(value) { this.#email = value.trim().toLowerCase() }
  get phone() { return this.#phone }
  set phone(value) { this.#phone = value || null }
  get avatarUrl() { return this.#avatarUrl }

  toJSON() {
    return { id: this.#id, name: this.#name, email: this.#email, phone: this.#phone, avatarUrl: this.#avatarUrl }
  }

  static fromRow(r) {
    return r && new UserProfile({ id: r.id, name: r.name, email: r.email, phone: r.phone, avatarUrl: r.avatar_url })
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT id, name, email, phone, avatar_url FROM users WHERE id = $1', [id])
    return UserProfile.fromRow(rows[0])
  }

  async save() {
    await pool.query('UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4', [
      this.#name, this.#email, this.#phone, this.#id,
    ])
  }

  static async setAvatar(id, url) {
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [url, id])
  }

  static async getPasswordHash(id) {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id])
    return rows[0]?.password_hash
  }

  static async setPasswordHash(id, hash) {
    await pool.query('UPDATE users SET password_hash = $1, password_changed_at = NOW() WHERE id = $2', [hash, id])
  }
}
