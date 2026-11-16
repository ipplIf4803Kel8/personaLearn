import { notificationService } from '../services/NotificationService.js'

const uid = (req) => req.user.sub

export async function list(req, res) {
  const data = await notificationService.list(uid(req), req.valid.query)
  res.json({ data, message: 'Daftar notifikasi' })
}

export async function detail(req, res) {
  const data = await notificationService.getOne(uid(req), req.valid.params.id)
  res.json({ data, message: 'Detail notifikasi' })
}

export async function markRead(req, res) {
  const data = await notificationService.markRead(uid(req), req.valid.params.id)
  res.json({ data, message: 'Notifikasi ditandai dibaca' })
}

export async function markAllRead(req, res) {
  const updated = await notificationService.markAllRead(uid(req))
  res.json({ data: { updated }, message: 'Semua notifikasi ditandai dibaca' })
}

export async function getSettings(req, res) {
  res.json({ data: await notificationService.getSettings(uid(req)), message: 'Pengaturan notifikasi' })
}

export async function updateSettings(req, res) {
  const data = await notificationService.updateSettings(uid(req), req.valid.body)
  res.json({ data, message: 'Pengaturan notifikasi disimpan' })
}
