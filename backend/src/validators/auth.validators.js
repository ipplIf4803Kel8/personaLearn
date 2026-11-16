import { z } from 'zod'

const EMAIL = /^\S+@\S+\.\S+$/
const PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
export const MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
]
export const VARK_STYLES = ['visual', 'auditory', 'reading', 'kinesthetic']

const email = z.string('Email wajib diisi').trim().toLowerCase().max(150, 'Email maksimal 150 karakter').regex(EMAIL, 'Email tidak valid')
const password = z
  .string('Kata sandi wajib diisi')
  .max(72, 'Kata sandi maksimal 72 karakter')
  .regex(PASSWORD, 'Kata sandi minimal 8 karakter dengan huruf dan angka')

export const registerSchema = z
  .object({
    name: z.string('Nama wajib diisi').trim().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter'),
    email,
    password,
    confirmPassword: z.string('Konfirmasi kata sandi wajib diisi'),
  })
  .strict()
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi kata sandi tidak cocok',
  })

export const loginSchema = z
  .object({ email, password: z.string('Kata sandi wajib diisi').min(1, 'Kata sandi wajib diisi') })
  .strict()

export const forgotPasswordSchema = z.object({ email }).strict()

export const resetPasswordSchema = z
  .object({
    email,
    otp: z.string('Kode OTP wajib diisi').trim().regex(/^\d{6}$/, 'Kode OTP harus 6 digit angka'),
    password,
  })
  .strict()

const nullable = (values, label) =>
  z
    .string()
    .transform((v) => v.toUpperCase())
    .pipe(z.enum(values, `${label} tidak valid`))
    .nullable()
    .optional()

export const preferencesSchema = z
  .object({
    mbtiType: nullable(MBTI_TYPES, 'Tipe MBTI'),
    varkStyle: z.enum(VARK_STYLES, 'Gaya belajar tidak valid').nullable().optional(),
  })
  .strict()
