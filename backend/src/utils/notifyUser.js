import pool from '../config/db.js'

// Titik tunggal pengiriman notifikasi dari fitur belajar. Memakai NotificationService bila sudah ada;
// kalau belum atau gagal, notifikasi ditulis langsung ke tabel notifications. Kegagalan tidak boleh
// menggagalkan proses belajar, jadi semua error ditelan.
export async function notifyUser(userId, { type, title, body }) {
  try {
    const mod = await import('../services/NotificationService.js').catch(() => null)
    if (mod?.notificationService) return await mod.notificationService.create(userId, { type, title, body })
    await pool.query('INSERT INTO notifications (user_id, type, title, body) VALUES ($1, $2, $3, $4)', [userId, type, title, body])
  } catch (err) {
    console.error('Notifikasi gagal dikirim', err.message)
  }
}
