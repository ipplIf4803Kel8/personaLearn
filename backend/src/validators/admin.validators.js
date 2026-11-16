import { z } from 'zod'
import { VARK_STYLES } from './auth.validators.js'

const id = z.coerce.number({ error: 'ID tidak valid' }).int('ID tidak valid').positive('ID tidak valid')
const bodyId = (label) => z.number({ error: `${label} tidak valid` }).int(`${label} tidak valid`).positive(`${label} tidak valid`)
const text = (label, max) =>
  z.string({ error: `${label} wajib diisi` }).trim().min(1, `${label} wajib diisi`).max(max, `${label} maksimal ${max} karakter`)
// Aturan sama dengan frontend/src/lib/adminValidation.js: http(s) atau potongan iframe embed YouTube.
const isHttpUrl = (v) => {
  try {
    return ['http:', 'https:'].includes(new URL(v).protocol)
  } catch {
    return false
  }
}
const YOUTUBE_EMBED = /^<iframe[^>]+src=["']https?:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\/[^"']+["']/i
const date = (label) => z.string({ error: `${label} wajib diisi` }).regex(/^\d{4}-\d{2}-\d{2}$/, `${label} tidak valid (YYYY-MM-DD)`)

// Semua body PATCH boleh sebagian, tetapi minimal satu field
const partial = (schema) =>
  schema.partial().refine((v) => Object.keys(v).length > 0, { message: 'Tidak ada data untuk diubah' })

export const idParams = z.strictObject({ id })

export const categoryBody = z.strictObject({
  name: text('Nama', 100),
  slug: z.string({ error: 'Slug wajib diisi' }).trim().min(1, 'Slug wajib diisi').max(100, 'Slug maksimal 100 karakter')
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug hanya huruf kecil, angka, dan tanda hubung'),
})
export const categoryPatch = partial(categoryBody)

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const tags = (values) => z.array(values ? z.enum(values, 'Tag tidak valid') : text('Tag', 30), { error: 'Tag harus berupa array' }).max(20, 'Tag maksimal 20')

const courseShape = {
  categoryId: bodyId('Kategori'),
  title: text('Judul', 200),
  description: z.string().trim().max(2000, 'Deskripsi maksimal 2000 karakter').nullable().transform((v) => v ?? ''),
  level: z.enum(LEVELS, 'Level tidak valid'),
  thumbnailUrl: z.string().trim().max(500, 'URL sampul maksimal 500 karakter')
    .refine((v) => !v || isHttpUrl(v), 'URL sampul harus diawali http:// atau https://').nullable().transform((v) => v ?? ''),
  isPublished: z.boolean({ error: 'Status terbit tidak valid' }),
  varkTags: tags(VARK_STYLES),
  personalityTags: tags(),
}
export const courseBody = z.strictObject({ ...courseShape }).partial().required({ categoryId: true, title: true })
export const coursePatch = partial(z.strictObject(courseShape))

const lessonShape = {
  title: text('Judul', 200),
  description: z.string().trim().max(2000, 'Deskripsi maksimal 2000 karakter'),
  videoUrl: z.string().trim().max(500, 'URL video maksimal 500 karakter')
    .refine((v) => !v || isHttpUrl(v) || YOUTUBE_EMBED.test(v), 'URL video harus diawali http:// atau https://, atau embed YouTube'),
  durationSeconds: z.number({ error: 'Durasi tidak valid' }).int('Durasi tidak valid').min(0, 'Durasi tidak valid').max(86400, 'Durasi terlalu besar'),
}
export const lessonBody = z.strictObject(lessonShape).partial().required({ title: true })
export const lessonPatch = partial(z.strictObject(lessonShape))

export const reorderBody = z.strictObject({
  ids: z.array(bodyId('ID pelajaran'), { error: 'ids harus berupa array bilangan bulat' }).min(1, 'ids tidak boleh kosong').max(500),
})

const challengeShape = {
  title: text('Judul', 200),
  description: z.string().trim().max(2000, 'Deskripsi maksimal 2000 karakter'),
  rewardPoints: z.number({ error: 'Poin tidak valid' }).int('Poin tidak valid').min(0, 'Poin tidak valid').max(100000, 'Poin terlalu besar'),
  startsAt: date('Tanggal mulai'),
  endsAt: date('Tanggal berakhir'),
  courseId: bodyId('Kelas').nullable(),
}
const datesInOrder = (v) => !v.startsAt || !v.endsAt || v.startsAt <= v.endsAt
const DATE_ORDER = { path: ['endsAt'], message: 'Tanggal berakhir tidak boleh sebelum tanggal mulai' }

export const challengeBody = z
  .strictObject(challengeShape)
  .partial()
  .required({ title: true, startsAt: true, endsAt: true })
  .refine(datesInOrder, DATE_ORDER)
export const challengePatch = partial(z.strictObject(challengeShape)).refine(datesInOrder, DATE_ORDER)

// userId mengirim ke satu pelajar; audience tetap diterima agar klien lama tidak putus
export const notificationBody = z.strictObject({
  title: text('Judul', 200),
  body: text('Isi', 2000),
  audience: text('Audiens', 100).optional(),
  userId: bodyId('Pelajar').optional(),
})

export const studentStatusBody = z.strictObject({ isActive: z.boolean({ error: 'isActive harus true atau false' }) })

const reportDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid (YYYY-MM-DD)')
  .refine((v) => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().startsWith(v), 'Tanggal tidak valid')
export const reportQuery = z
  .strictObject({ from: reportDate.optional(), to: reportDate.optional() })
  .refine((v) => !v.from || !v.to || v.from <= v.to, { path: ['to'], message: 'Tanggal akhir tidak boleh sebelum tanggal awal' })
