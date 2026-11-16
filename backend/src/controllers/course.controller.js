import { courseService } from '../services/CourseService.js'
import { recommendationService } from '../services/RecommendationService.js'

// Controller tipis: ambil input yang sudah divalidasi, panggil service, bungkus response.
export const categories = async (req, res) =>
  res.json({ data: await courseService.listCategories(), message: 'Daftar kategori' })

export async function list(req, res) {
  const { search, category, ...rest } = req.valid.query
  const { items, meta } = await courseService.list(req.user.sub, { ...rest, q: search, categoryId: category })
  res.json({ data: items, meta, message: 'Daftar kelas' })
}

export async function popular(req, res) {
  const { items, meta } = await courseService.popular(req.user.sub, req.valid.query.limit)
  res.json({ data: items, meta, message: 'Kelas populer' })
}

export async function recommended(req, res) {
  const items = await recommendationService.recommend(req.user.sub, req.valid.query.limit)
  res.json({ data: items, meta: { page: 1, limit: req.valid.query.limit, total: items.length }, message: 'Rekomendasi kelas' })
}

export const detail = async (req, res) =>
  res.json({ data: await courseService.getDetail(req.user.sub, req.valid.params.id), message: 'Detail kelas' })

export const preview = async (req, res) =>
  res.json({ data: await courseService.getPreview(req.valid.params.id), message: 'Pratinjau kelas' })

export async function enroll(req, res) {
  const data = await courseService.enroll(req.user.sub, req.valid.params.id)
  res.status(data.alreadyEnrolled ? 200 : 201).json({ data, message: data.alreadyEnrolled ? 'Kelas sudah diambil' : 'Kelas berhasil diambil' })
}

export async function rate(req, res) {
  const { rating, review } = req.valid.body
  const data = await courseService.rate(req.user.sub, req.valid.params.id, rating, review)
  res.json({ data, message: 'Rating tersimpan' })
}

export const addFavorite = async (req, res) =>
  res.json({ data: await courseService.addFavorite(req.user.sub, req.valid.params.id), message: 'Ditambahkan ke favorit' })

export const removeFavorite = async (req, res) =>
  res.json({ data: await courseService.removeFavorite(req.user.sub, req.valid.params.id), message: 'Dihapus dari favorit' })
