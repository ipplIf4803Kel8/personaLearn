import { z } from 'zod'

const id = z.coerce.number({ message: 'ID tidak valid' }).int('ID tidak valid').positive('ID tidak valid')
const page = z.coerce.number().int().min(1, 'page minimal 1').default(1)
const limit = (max, fallback) => z.coerce.number().int().min(1, 'limit minimal 1').max(max, `limit maksimal ${max}`).default(fallback)

export const idParams = z.strictObject({ id })

export const listQuery = z.strictObject({
  search: z.string().trim().max(100, 'Pencarian maksimal 100 karakter').optional(),
  category: id.optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced'], { message: 'Level tidak valid' }).optional(),
  minRating: z.coerce.number().min(0, 'minRating 0 sampai 5').max(5, 'minRating 0 sampai 5').optional(),
  maxDurationMinutes: z.coerce.number().int().min(0).optional(),
  favoritesOnly: z.enum(['true', 'false']).optional(),
  sort: z.enum(['popular', 'rating', 'newest'], { message: 'sort harus popular, rating, atau newest' }).optional(),
  page,
  limit: limit(100, 10),
})

export const shortListQuery = z.strictObject({ limit: limit(50, 10) })

export const ratingBody = z.strictObject({
  rating: z.number({ message: 'Rating harus berupa angka 1 sampai 5' }).int('Rating harus bilangan bulat').min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5'),
  review: z.string().trim().max(500, 'Ulasan maksimal 500 karakter').optional(),
})
