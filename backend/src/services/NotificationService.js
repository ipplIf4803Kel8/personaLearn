import { Notification } from '../models/Notification.js'
import { NotificationSetting } from '../models/NotificationSetting.js'
import { HttpError } from '../utils/httpError.js'

export class NotificationService {
  // Membuat notifikasi untuk satu pengguna; mengembalikan null bila jenisnya dimatikan di pengaturan
  async create(userId, { type = 'info', title, body }) {
    const settings = await NotificationSetting.findOrCreate(userId)
    if (!settings.allows(type)) return null
    return Notification.insert(userId, { type, title, body })
  }

  async list(userId, { page, limit }) {
    const [items, counts] = await Promise.all([
      Notification.findByUser(userId, limit, (page - 1) * limit),
      Notification.countByUser(userId),
    ])
    return { items, page, limit, total: counts.total, unread: counts.unread }
  }

  async getOne(userId, id) {
    const notification = await Notification.findById(userId, id)
    if (!notification) throw new HttpError(404, 'Notifikasi tidak ditemukan')
    return notification
  }

  async markRead(userId, id) {
    const notification = await Notification.markRead(userId, id)
    if (!notification) throw new HttpError(404, 'Notifikasi tidak ditemukan')
    return notification
  }

  markAllRead(userId) {
    return Notification.markAllRead(userId)
  }

  getSettings(userId) {
    return NotificationSetting.findOrCreate(userId)
  }

  updateSettings(userId, settings) {
    return NotificationSetting.save(userId, settings)
  }
}

export const notificationService = new NotificationService()
