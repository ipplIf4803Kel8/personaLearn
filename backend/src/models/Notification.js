import pool from '../config/db.js'

export class Notification {
  #id
  #userId
  #type
  #title
  #body
  #isRead
  #createdAt

  constructor({ id, userId, type, title, body, isRead, createdAt }) {
    this.#id = id
    this.#userId = userId
    this.#type = type
    this.#title = title
    this.#body = body
    this.#isRead = isRead
    this.#createdAt = createdAt
  }

  get id() { return this.#id }
  get userId() { return this.#userId }
  get type() { return this.#type }
  get title() { return this.#title }
  get body() { return this.#body }
  get isRead() { return this.#isRead }
  set isRead(value) { this.#isRead = Boolean(value) }
  get createdAt() { return this.#createdAt }

  toJSON() {
    return {
      id: this.#id,
      type: this.#type,
      title: this.#title,
      body: this.#body,
      isRead: this.#isRead,
      createdAt: this.#createdAt,
    }
  }

  static fromRow(r) {
    return r && new Notification({
      id: r.id, userId: r.user_id, type: r.type, title: r.title, body: r.body, isRead: r.is_read, createdAt: r.created_at,
    })
  }

  static async insert(userId, { type, title, body }) {
    const { rows } = await pool.query(
      'INSERT INTO notifications (user_id, type, title, body) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, type, title, body]
    )
    return Notification.fromRow(rows[0])
  }

  static async findByUser(userId, limit, offset) {
    const { rows } = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    )
    return rows.map(Notification.fromRow)
  }

  static async findById(userId, id) {
    const { rows } = await pool.query('SELECT * FROM notifications WHERE id = $1 AND user_id = $2', [id, userId])
    return Notification.fromRow(rows[0])
  }

  static async countByUser(userId) {
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE NOT is_read)::int AS unread FROM notifications WHERE user_id = $1',
      [userId]
    )
    return rows[0]
  }

  static async markRead(userId, id) {
    const { rows } = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    )
    return Notification.fromRow(rows[0])
  }

  static async markAllRead(userId) {
    const { rowCount } = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND NOT is_read',
      [userId]
    )
    return rowCount
  }

  // Fan-out kiriman admin ke pelajar aktif. userId mengirim ke satu pelajar; tanpa userId,
  // 'Semua Pelajar' mengirim ke semua dan nilai lain dicocokkan dengan nama (cara lama).
  static async insertForAudience(broadcastId, { title, body, audience, userId = null }, db = pool) {
    const { rowCount } = await db.query(
      `INSERT INTO notifications (user_id, broadcast_id, type, title, body)
       SELECT id, $1, 'broadcast', $2, $3 FROM users
       WHERE role = 'student' AND is_active
         AND CASE WHEN $5::int IS NOT NULL THEN id = $5 ELSE ($4::text = 'Semua Pelajar' OR name = $4) END`,
      [broadcastId, title, body, audience, userId]
    )
    return rowCount
  }
}
