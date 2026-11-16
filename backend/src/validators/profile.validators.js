import { z } from 'zod'

const password = z.string({ message: 'Kata sandi wajib diisi' })

export const profileBody = z.object({
  name: z.string({ message: 'Nama wajib diisi' }).trim().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  email: z.string({ message: 'Email wajib diisi' }).trim().max(150, 'Email maksimal 150 karakter').regex(/^\S+@\S+\.\S+$/, 'Email tidak valid'),
  phone: z.string().trim().regex(/^\+?[0-9][0-9 -]{7,18}$/, 'Nomor telepon tidak valid').or(z.literal('')).nullable().optional(),
}).strict()

export const passwordBody = z.object({
  oldPassword: password.min(1, 'Kata sandi lama wajib diisi'),
  newPassword: password.max(72, 'Maksimal 72 karakter').regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, 'Minimal 8 karakter dengan huruf dan angka'),
}).strict().refine((v) => v.oldPassword !== v.newPassword, {
  path: ['newPassword'],
  message: 'Kata sandi baru harus berbeda dari yang lama',
})
