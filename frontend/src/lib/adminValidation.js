import { isHttpUrl } from './validators'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
// Potongan <iframe> embed YouTube yang ditempel apa adanya
const YOUTUBE_EMBED = /^<iframe[^>]+src=["']https?:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\/[^"']+["']/i

const text = (value) => String(value ?? '').trim()

function required(errors, key, value, label, max) {
  const v = text(value)
  if (!v) errors[key] = `${label} wajib diisi`
  else if (max && v.length > max) errors[key] = `${label} maksimal ${max} karakter`
}

export function validateCategory({ name, slug }) {
  const errors = {}
  required(errors, 'name', name, 'Nama', 100)
  if (text(slug) && !SLUG.test(text(slug))) errors.slug = 'Slug hanya huruf kecil, angka, dan tanda strip'
  return errors
}

export function validateCourse({ title, categoryId, level, coverUrl }) {
  const errors = {}
  required(errors, 'title', title, 'Judul', 200)
  if (!categoryId) errors.categoryId = 'Kategori wajib dipilih'
  if (!LEVELS.includes(level)) errors.level = 'Level harus Beginner, Intermediate, atau Advanced'
  if (text(coverUrl) && !isHttpUrl(text(coverUrl))) errors.coverUrl = 'URL sampul harus diawali http:// atau https://'
  return errors
}

export function validateLesson({ title, videoUrl, durationMinutes }) {
  const errors = {}
  required(errors, 'title', title, 'Judul')
  const url = text(videoUrl)
  if (url && !isHttpUrl(url) && !YOUTUBE_EMBED.test(url)) {
    errors.videoUrl = 'URL video harus diawali http:// atau https://, atau embed YouTube'
  }
  const minutes = text(durationMinutes)
  if (minutes && !(Number.isFinite(Number(minutes)) && Number(minutes) >= 0)) {
    errors.durationMinutes = 'Durasi harus berupa angka 0 atau lebih'
  }
  return errors
}

export function validateChallenge({ title, rewardPoints, startsAt, endsAt }) {
  const errors = {}
  required(errors, 'title', title, 'Judul')
  const points = text(rewardPoints)
  if (points === '' || !Number.isInteger(Number(points)) || Number(points) < 0) {
    errors.rewardPoints = 'Poin harus bilangan bulat 0 atau lebih'
  }
  if (startsAt && endsAt && endsAt < startsAt) errors.endsAt = 'Tanggal berakhir tidak boleh sebelum tanggal mulai'
  return errors
}

export function validateNotification({ title, body }) {
  const errors = {}
  required(errors, 'title', title, 'Judul')
  required(errors, 'body', body, 'Isi pesan')
  return errors
}
