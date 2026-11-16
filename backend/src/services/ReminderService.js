import pool from '../config/db.js'
import { notificationService } from './NotificationService.js'

const TICK_MS = 60000

// Jam, tanggal, dan hari (1 = Senin) di zona waktu tz, dihitung dengan Intl
export function localParts(now, tz) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
    }).formatToParts(now).map((x) => [x.type, x.value])
  )
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    time: `${p.hour}:${p.minute}`,
    weekday: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday) + 1,
  }
}

// Fungsi murni: perlu diingatkan sekarang? setting = { reminderEnabled, reminderTime 'HH:MM', frequency
// 'daily'|'weekly', lastSentOn 'YYYY-MM-DD'|null }, local = hasil localParts, studiedToday = boolean.
// Weekly dikirim tiap Senin (paling sederhana, tanpa menyimpan hari pembuatan pengaturan).
export function shouldRemind(setting, local, studiedToday) {
  if (!setting.reminderEnabled) return false
  if (setting.reminderTime.slice(0, 5) !== local.time) return false
  if (setting.frequency === 'weekly' && local.weekday !== 1) return false
  if (setting.lastSentOn === local.date) return false
  return !studiedToday
}

// ponytail: satu proses, tanpa antrean. Menit yang terlewat (server mati/tick telat) tidak dikejar,
// dan dua instance berjalan aman hanya karena klaim UPDATE atomik. Pindah ke job queue bila perlu skala.
export class ReminderService {
  #timer = null
  #running = false
  #tz

  constructor(tz = process.env.REMINDER_TZ || 'Asia/Jakarta') {
    this.#tz = tz
  }

  start() {
    if (this.#timer) return
    this.#timer = setInterval(() => this.tick().catch((e) => console.error('Pengingat gagal:', e.message)), TICK_MS)
  }

  stop() {
    clearInterval(this.#timer)
    this.#timer = null
  }

  // Mengembalikan jumlah pengingat yang dibuat
  async tick(now = new Date()) {
    if (this.#running) return 0
    this.#running = true
    try {
      const local = localParts(now, this.#tz)
      const { rows } = await pool.query(
        `SELECT ns.user_id, ns.reminder_enabled, ns.reminder_time, ns.frequency, ns.last_reminder_sent_on AS last_sent_on,
           EXISTS (SELECT 1 FROM lesson_progress lp WHERE lp.user_id = ns.user_id AND lp.completed_at IS NOT NULL
             AND (lp.completed_at AT TIME ZONE current_setting('TimeZone') AT TIME ZONE $2)::date = $3::date) AS studied_today
         FROM notification_settings ns JOIN users u ON u.id = ns.user_id
         WHERE ns.reminder_enabled AND u.is_active AND u.role = 'student'
           AND to_char(ns.reminder_time, 'HH24:MI') = $1`,
        [local.time, this.#tz, local.date]
      )
      let sent = 0
      for (const r of rows) {
        try {
          const setting = {
            reminderEnabled: r.reminder_enabled, reminderTime: String(r.reminder_time),
            frequency: r.frequency, lastSentOn: r.last_sent_on,
          }
          if (!shouldRemind(setting, local, r.studied_today)) continue
          if (await this.#send(r.user_id, local.date)) sent++
        } catch (e) {
          console.error(`Pengingat untuk pengguna ${r.user_id} gagal:`, e.message)
        }
      }
      return sent
    } finally {
      this.#running = false
    }
  }

  async #send(userId, today) {
    // Klaim hari ini secara atomik; yang kalah balapan tidak mengirim
    const claim = await pool.query(
      `UPDATE notification_settings SET last_reminder_sent_on = $2
       WHERE user_id = $1 AND last_reminder_sent_on IS DISTINCT FROM $2::date`,
      [userId, today]
    )
    if (!claim.rowCount) return false
    try {
      const { rows } = await pool.query(
        `SELECT c.title FROM enrollments e JOIN courses c ON c.id = e.course_id
         WHERE e.user_id = $1
           AND (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id)
             > (SELECT COUNT(*) FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
                WHERE lp.user_id = e.user_id AND l.course_id = c.id AND lp.completed_at IS NOT NULL)
         ORDER BY e.enrolled_at DESC LIMIT 1`,
        [userId]
      )
      const body = rows[0]
        ? `Yuk lanjutkan belajar kelas "${rows[0].title}" hari ini. Sedikit demi sedikit, hasilnya akan terasa.`
        : 'Belum ada kelas yang sedang berjalan. Yuk jelajahi kelas yang tersedia dan mulai belajar hari ini.'
      const created = await notificationService.create(userId, { type: 'reminder', title: 'Waktunya belajar', body })
      if (!created) throw new Error('notifikasi tidak dibuat')
      return true
    } catch (e) {
      await pool.query('UPDATE notification_settings SET last_reminder_sent_on = NULL WHERE user_id = $1', [userId])
      throw e
    }
  }
}
