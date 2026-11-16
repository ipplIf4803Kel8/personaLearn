import pool from '../config/db.js'
import { toCamel } from '../utils/camelCase.js'

// Riwayat kiriman admin. Tiap penerima punya baris sendiri di notifications (broadcast_id menautkan).
export class NotificationBroadcast {
  static async list() {
    const { rows } = await pool.query('SELECT * FROM notification_broadcasts ORDER BY sent_at DESC, id DESC')
    return rows.map(toCamel)
  }

  static async insert({ title, body, audience }, db = pool) {
    const { rows } = await db.query(
      'INSERT INTO notification_broadcasts (title, body, audience) VALUES ($1, $2, $3) RETURNING *',
      [title, body, audience]
    )
    return toCamel(rows[0])
  }

  static async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM notification_broadcasts WHERE id = $1', [id])
    return rowCount > 0
  }
}
