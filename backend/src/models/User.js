import pool from '../config/db.js'

const SELECT_WITH_PREFS = `SELECT u.*, lp.mbti_type, lp.vark_style
  FROM users u LEFT JOIN learning_preferences lp ON lp.user_id = u.id`

export default class User {
  #id
  #name
  #email
  #passwordHash
  #role
  #phone
  #avatarUrl
  #isActive
  #mbtiType
  #varkStyle
  #createdAt

  constructor(row) {
    this.#id = row.id
    this.#name = row.name
    this.#email = row.email
    this.#passwordHash = row.password_hash
    this.#role = row.role
    this.#phone = row.phone ?? null
    this.#avatarUrl = row.avatar_url ?? null
    this.#isActive = row.is_active
    this.#mbtiType = row.mbti_type ?? null
    this.#varkStyle = row.vark_style ?? null
    this.#createdAt = row.created_at
  }

  get id() { return this.#id }
  get name() { return this.#name }
  get email() { return this.#email }
  get passwordHash() { return this.#passwordHash }
  get role() { return this.#role }
  get phone() { return this.#phone }
  get avatarUrl() { return this.#avatarUrl }
  get isActive() { return this.#isActive }
  get mbtiType() { return this.#mbtiType }
  get varkStyle() { return this.#varkStyle }
  get createdAt() { return this.#createdAt }

  set name(value) { this.#name = value }
  set phone(value) { this.#phone = value }

  // Bentuk yang dikirim ke klien; password_hash tidak pernah ikut.
  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      email: this.#email,
      role: this.#role,
      phone: this.#phone,
      avatarUrl: this.#avatarUrl,
      isActive: this.#isActive,
      mbtiType: this.#mbtiType,
      varkStyle: this.#varkStyle,
      createdAt: this.#createdAt,
    }
  }

  static async findById(id) {
    const { rows } = await pool.query(`${SELECT_WITH_PREFS} WHERE u.id = $1`, [id])
    return rows[0] ? new User(rows[0]) : null
  }

  static async findByEmail(email) {
    const { rows } = await pool.query(`${SELECT_WITH_PREFS} WHERE u.email = $1`, [email])
    return rows[0] ? new User(rows[0]) : null
  }

  static async create({ name, email, passwordHash }) {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, last_login_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [name, email, passwordHash]
    )
    return new User(rows[0])
  }

  static async touchLogin(id) {
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [id])
  }

  // revoke: false untuk rehash otomatis, agar sesi yang ada tidak ikut dicabut.
  static async updatePassword(id, passwordHash, { revoke = true } = {}) {
    await pool.query(
      `UPDATE users SET password_hash = $1, password_changed_at = CASE WHEN $3 THEN NOW() ELSE password_changed_at END WHERE id = $2`,
      [passwordHash, id, revoke]
    )
  }
}
