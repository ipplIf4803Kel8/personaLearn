// Unit test skema zod: tanpa database.
import { describe, expect, it } from 'vitest'
import { forgotPasswordSchema, loginSchema, preferencesSchema, registerSchema, resetPasswordSchema } from '../src/validators/auth.validators.js'
import { idParams, listQuery, ratingBody } from '../src/validators/course.validators.js'
import { completeLessonBody, reactionBody } from '../src/validators/learning.validators.js'
import { passwordBody, profileBody } from '../src/validators/profile.validators.js'
import {
  categoryBody,
  challengeBody,
  challengePatch,
  courseBody,
  notificationBody,
  reportQuery,
  studentStatusBody,
} from '../src/validators/admin.validators.js'

const ok = (schema, data) => expect(schema.safeParse(data).success, JSON.stringify(data)).toBe(true)
const bad = (schema, data) => expect(schema.safeParse(data).success, JSON.stringify(data)).toBe(false)

describe('validator auth', () => {
  const register = { name: 'Siti', email: 'siti@test.id', password: 'rahasia123', confirmPassword: 'rahasia123' }

  it('register menerima data benar dan merapikan email', () => {
    expect(registerSchema.parse({ ...register, email: ' SITI@Test.ID ' }).email).toBe('siti@test.id')
  })
  it('register menolak sandi lemah, konfirmasi beda, email salah, dan field asing', () => {
    bad(registerSchema, { ...register, password: 'pendek1', confirmPassword: 'pendek1' })
    bad(registerSchema, { ...register, password: 'hurufsaja', confirmPassword: 'hurufsaja' })
    bad(registerSchema, { ...register, confirmPassword: 'lain12345' })
    bad(registerSchema, { ...register, email: 'bukan-email' })
    bad(registerSchema, { ...register, role: 'admin' })
  })
  it('login, forgot, dan reset', () => {
    ok(loginSchema, { email: 'a@b.co', password: 'x' })
    bad(loginSchema, { email: 'a@b.co', password: '' })
    ok(forgotPasswordSchema, { email: 'a@b.co' })
    ok(resetPasswordSchema, { email: 'a@b.co', otp: '012345', password: 'rahasia123' })
    bad(resetPasswordSchema, { email: 'a@b.co', otp: '12345', password: 'rahasia123' })
    bad(resetPasswordSchema, { email: 'a@b.co', otp: 'abcdef', password: 'rahasia123' })
  })
  it('preferensi hanya MBTI 16 tipe dan 4 gaya VARK, tanpa Big Five', () => {
    expect(preferencesSchema.parse({ mbtiType: 'intp', varkStyle: 'visual' })).toEqual({ mbtiType: 'INTP', varkStyle: 'visual' })
    ok(preferencesSchema, { mbtiType: null, varkStyle: null })
    bad(preferencesSchema, { mbtiType: 'XXXX' })
    bad(preferencesSchema, { varkStyle: 'musical' })
    bad(preferencesSchema, { openness: 4 })
  })
})

describe('validator course', () => {
  it('params id harus bilangan bulat positif', () => {
    expect(idParams.parse({ id: '5' }).id).toBe(5)
    for (const id of ['abc', '0', '-1', '1.5']) bad(idParams, { id })
  })
  it('query daftar kelas memberi default dan menolak yang tidak dikenal', () => {
    expect(listQuery.parse({})).toMatchObject({ page: 1, limit: 10 })
    bad(listQuery, { sort: 'title' })
    bad(listQuery, { minRating: '6' })
    bad(listQuery, { limit: '1000' })
    bad(listQuery, { foo: '1' })
  })
  it('rating 1 sampai 5 bilangan bulat', () => {
    ok(ratingBody, { rating: 5, review: 'bagus' })
    for (const rating of [0, 6, 3.5, '4']) bad(ratingBody, { rating })
  })
})

describe('validator learning', () => {
  it('complete dan reaksi', () => {
    ok(completeLessonBody, {})
    ok(completeLessonBody, { positionSeconds: 30 })
    bad(completeLessonBody, { positionSeconds: -1 })
    ok(reactionBody, { reaction: 'like' })
    ok(reactionBody, { reaction: null })
    bad(reactionBody, { reaction: 'love' })
  })
})

describe('validator profile', () => {
  it('profil', () => {
    ok(profileBody, { name: 'Siti', email: 'siti@test.id', phone: '081234567890' })
    ok(profileBody, { name: 'Siti', email: 'siti@test.id', phone: '' })
    bad(profileBody, { name: ' ', email: 'siti@test.id' })
    bad(profileBody, { name: 'Siti', email: 'siti@test.id', phone: 'abc' })
    bad(profileBody, { name: 'Siti', email: 'siti@test.id', role: 'admin' })
  })
  it('ganti sandi wajib beda dan kuat', () => {
    ok(passwordBody, { oldPassword: 'lama12345', newPassword: 'baru12345' })
    bad(passwordBody, { oldPassword: 'sama12345', newPassword: 'sama12345' })
    bad(passwordBody, { oldPassword: 'lama12345', newPassword: 'pendek' })
  })
})

describe('validator admin', () => {
  it('kategori dan kelas', () => {
    ok(categoryBody, { name: 'Desain', slug: 'desain-grafis' })
    bad(categoryBody, { name: 'Desain', slug: 'Desain Grafis' })
    ok(courseBody, { categoryId: 1, title: 'Kelas', varkTags: ['visual'] })
    bad(courseBody, { title: 'Tanpa kategori' })
    bad(courseBody, { categoryId: 1, title: 'K', varkTags: ['bukan'] })
    bad(courseBody, { categoryId: 1, title: 'K', level: 'Pro' })
  })
  it('tantangan memeriksa urutan tanggal', () => {
    ok(challengeBody, { title: 'T', startsAt: '2026-01-01', endsAt: '2026-01-01' })
    bad(challengeBody, { title: 'T', startsAt: '2026-01-02', endsAt: '2026-01-01' })
    ok(challengePatch, { rewardPoints: 10 })
    bad(challengePatch, {})
  })
  it('notifikasi, status pelajar, dan rentang laporan', () => {
    ok(notificationBody, { title: 'a', body: 'b', userId: 3 })
    bad(notificationBody, { title: 'a', body: 'b', userId: 'x' })
    ok(studentStatusBody, { isActive: false })
    bad(studentStatusBody, { isActive: 'false' })
    ok(reportQuery, { from: '2026-01-01', to: '2026-01-31' })
    bad(reportQuery, { from: '2026-02-30' })
    bad(reportQuery, { from: '2026-02-01', to: '2026-01-01' })
  })
})
