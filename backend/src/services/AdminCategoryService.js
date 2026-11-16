import { Category } from '../models/Category.js'
import { HttpError } from '../utils/httpError.js'

const NOT_FOUND = 'Kategori tidak ditemukan'

async function slugTaken(fn) {
  try {
    return await fn()
  } catch (err) {
    if (err.code === '23505' && /slug/.test(err.constraint ?? '')) throw new HttpError(409, 'Slug sudah dipakai', { slug: 'Slug sudah dipakai' })
    throw err
  }
}

export class AdminCategoryService {
  list() {
    return Category.listAdmin()
  }

  async create(data) {
    return slugTaken(() => Category.insert(data))
  }

  async update(id, data) {
    const category = await slugTaken(() => Category.update(id, data))
    if (!category) throw new HttpError(404, NOT_FOUND)
    return category
  }

  async delete(id) {
    let deleted
    try {
      deleted = await Category.delete(id)
    } catch (err) {
      if (err.code === '23503') throw new HttpError(409, 'Kategori masih dipakai oleh kelas, pindahkan atau hapus kelasnya dulu')
      throw err
    }
    if (!deleted) throw new HttpError(404, NOT_FOUND)
  }
}

export const adminCategoryService = new AdminCategoryService()
