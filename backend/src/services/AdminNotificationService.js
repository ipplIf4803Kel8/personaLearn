import pool from '../config/db.js'
import { Notification } from '../models/Notification.js'
import { NotificationBroadcast } from '../models/NotificationBroadcast.js'
import { Student } from '../models/Student.js'
import { HttpError } from '../utils/httpError.js'

export const ALL_STUDENTS = 'Semua Pelajar'

export class AdminNotificationService {
  list() {
    return NotificationBroadcast.list()
  }

  // Tanpa userId dikirim ke semua pelajar aktif; dengan userId hanya ke pelajar itu.
  // Riwayat kiriman dan notifikasi tiap penerima ditulis dalam satu transaksi.
  async send({ title, body, audience = ALL_STUDENTS, userId = null }) {
    if (userId !== null) audience = await this.#studentName(userId)
    const db = await pool.connect()
    try {
      await db.query('BEGIN')
      const broadcast = await NotificationBroadcast.insert({ title, body, audience }, db)
      const recipients = await Notification.insertForAudience(broadcast.id, { title, body, audience, userId }, db)
      await db.query('COMMIT')
      return { ...broadcast, recipients }
    } catch (err) {
      await db.query('ROLLBACK').catch(() => {})
      throw err
    } finally {
      db.release()
    }
  }

  async #studentName(userId) {
    const student = await Student.findDetail(userId)
    if (!student) throw new HttpError(404, 'Pelajar tidak ditemukan')
    return student.name
  }

  async delete(id) {
    if (!(await NotificationBroadcast.delete(id))) throw new HttpError(404, 'Notifikasi tidak ditemukan')
  }
}

export const adminNotificationService = new AdminNotificationService()
