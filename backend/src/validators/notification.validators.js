import { z } from 'zod'

export const listQuery = z.object({
  page: z.coerce.number({ message: 'Halaman tidak valid' }).int().min(1, 'Halaman tidak valid').default(1),
  limit: z.coerce.number({ message: 'Batas tidak valid' }).int().min(1, 'Batas tidak valid').max(50, 'Maksimal 50 per halaman').default(20),
}).strict()

export const idParams = z.object({
  id: z.coerce.number({ message: 'ID tidak valid' }).int().positive('ID tidak valid'),
}).strict()

export const settingsBody = z.object({
  reminderEnabled: z.boolean({ message: 'Pengingat harus berupa ya atau tidak' }),
  reminderTime: z.string({ message: 'Waktu pengingat wajib diisi' }).regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Waktu pengingat tidak valid (HH:MM)'),
  frequency: z.enum(['harian', 'mingguan'], { message: 'Frekuensi harus harian atau mingguan' }),
  allowPromo: z.boolean({ message: 'Pilihan promo tidak valid' }),
  allowChallenge: z.boolean({ message: 'Pilihan tantangan tidak valid' }),
}).strict()
