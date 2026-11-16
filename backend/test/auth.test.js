// Jalankan terhadap DB uji: DB_NAME=personalearn_test. Hanya menghapus akun @auth.test.
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import crypto from 'node:crypto'

const sent = vi.hoisted(() => ({ otp: null }))
vi.mock('../src/utils/mailer.js', () => ({
  sendOtpEmail: async (to, otp) => {
    sent.otp = otp
  },
}))

const { default: app } = await import('../src/app.js')
const { default: pool } = await import('../src/config/db.js')
const { hashPassword, verifyPassword } = await import('../src/utils/security.js')

const valid = { name: 'Siti', email: 'siti@auth.test', password: 'rahasia123', confirmPassword: 'rahasia123' }
const post = (path, body) => request(app).post(`/api${path}`).send(body)

beforeEach(async () => {
  sent.otp = null
  await pool.query("DELETE FROM users WHERE email LIKE '%@auth.test'")
})
afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email LIKE '%@auth.test'")
  await pool.end()
})

describe('hash password', () => {
  it('memakai bcrypt dan tetap bisa memverifikasi hash scrypt lama', () => {
    expect(hashPassword('abc12345')).toMatch(/^\$2[aby]\$10\$/)
    const salt = 'aa'.repeat(16)
    const legacy = `${salt}:${crypto.scryptSync('abc12345', salt, 64).toString('hex')}`
    expect(verifyPassword('abc12345', legacy)).toBe(true)
    expect(verifyPassword('salah', legacy)).toBe(false)
  })
})

describe('register', () => {
  it('membuat akun student dan tidak membocorkan hash', async () => {
    const res = await post('/auth/register', valid)
    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user).toMatchObject({ email: 'siti@auth.test', role: 'student' })
    expect(JSON.stringify(res.body)).not.toMatch(/password/i)
  })

  it('menolak input tidak valid dengan pesan per kolom', async () => {
    const res = await post('/auth/register', { ...valid, name: '', email: 'x', password: 'abc', confirmPassword: 'beda' })
    expect(res.status).toBe(422)
    expect(Object.keys(res.body.errors)).toEqual(expect.arrayContaining(['name', 'email', 'password']))
  })

  it('menolak konfirmasi berbeda, field asing, dan email ganda', async () => {
    expect((await post('/auth/register', { ...valid, confirmPassword: 'lain12345' })).body.errors).toHaveProperty('confirmPassword')
    expect((await post('/auth/register', { ...valid, role: 'admin' })).status).toBe(422)
    await post('/auth/register', valid)
    const dup = await post('/auth/register', valid)
    expect(dup.status).toBe(409)
    expect(dup.body.errors.email).toBeTruthy()
  })
})

describe('login dan me', () => {
  it('berhasil, lalu /auth/me mengembalikan user', async () => {
    await post('/auth/register', valid)
    const res = await post('/auth/login', { email: 'SITI@auth.test', password: 'rahasia123' })
    expect(res.status).toBe(200)
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${res.body.token}`)
    expect(me.body.email).toBe('siti@auth.test')
  })

  it('menolak kata sandi salah dan akun nonaktif', async () => {
    await post('/auth/register', valid)
    expect((await post('/auth/login', { email: valid.email, password: 'salah12345' })).status).toBe(401)
    await pool.query("UPDATE users SET is_active = FALSE WHERE email = 'siti@auth.test'")
    expect((await post('/auth/login', { email: valid.email, password: 'rahasia123' })).status).toBe(403)
  })

  it('mengganti hash scrypt lama ke bcrypt saat login', async () => {
    const salt = 'bb'.repeat(16)
    const legacy = `${salt}:${crypto.scryptSync('rahasia123', salt, 64).toString('hex')}`
    await pool.query("INSERT INTO users (name, email, password_hash) VALUES ('Lama', 'lama@auth.test', $1)", [legacy])
    expect((await post('/auth/login', { email: 'lama@auth.test', password: 'rahasia123' })).status).toBe(200)
    const { rows } = await pool.query("SELECT password_hash FROM users WHERE email = 'lama@auth.test'")
    expect(rows[0].password_hash).toMatch(/^\$2/)
  })
})

describe('lupa dan atur ulang kata sandi', () => {
  it('menjawab sama untuk email terdaftar dan tidak', async () => {
    await post('/auth/register', valid)
    const a = await post('/auth/forgot-password', { email: valid.email })
    expect(sent.otp).toMatch(/^\d{6}$/)
    sent.otp = null
    const b = await post('/auth/forgot-password', { email: 'tidak-ada@auth.test' })
    expect(sent.otp).toBeNull()
    expect([a.status, a.body]).toEqual([b.status, b.body])
  })

  it('mengatur ulang dengan OTP benar, sekali pakai', async () => {
    await post('/auth/register', valid)
    await post('/auth/forgot-password', { email: valid.email })
    const body = { email: valid.email, otp: sent.otp, password: 'baru12345' }
    expect((await post('/auth/reset-password', body)).status).toBe(200)
    expect((await post('/auth/login', { email: valid.email, password: 'baru12345' })).status).toBe(200)
    expect((await post('/auth/reset-password', body)).status).toBe(400)
  })

  it('menolak OTP salah dan memblokir setelah 5 percobaan', async () => {
    await post('/auth/register', valid)
    await post('/auth/forgot-password', { email: valid.email })
    const real = sent.otp
    const wrong = real === '000000' ? '111111' : '000000'
    for (let i = 0; i < 5; i++) {
      expect((await post('/auth/reset-password', { email: valid.email, otp: wrong, password: 'baru12345' })).status).toBe(400)
    }
    expect((await post('/auth/reset-password', { email: valid.email, otp: real, password: 'baru12345' })).status).toBe(400)
  })

  it('menolak OTP kedaluwarsa dan kata sandi baru lemah', async () => {
    await post('/auth/register', valid)
    await post('/auth/forgot-password', { email: valid.email })
    expect((await post('/auth/reset-password', { email: valid.email, otp: sent.otp, password: 'pendek' })).status).toBe(422)
    await pool.query("UPDATE password_resets SET expires_at = NOW() - interval '1 minute'")
    expect((await post('/auth/reset-password', { email: valid.email, otp: sent.otp, password: 'baru12345' })).status).toBe(400)
  })
})

describe('preferensi belajar', () => {
  const login = async () => (await post('/auth/register', valid)).body.token
  const put = (token, body) => request(app).put('/api/me/preferences').set('Authorization', `Bearer ${token}`).send(body)

  it('kosong di awal, bisa disimpan dan diubah, null berarti belum tahu', async () => {
    const token = await login()
    const get = () => request(app).get('/api/me/preferences').set('Authorization', `Bearer ${token}`)
    expect((await get()).body.data).toEqual({ mbtiType: null, varkStyle: null })
    expect((await put(token, { mbtiType: 'intp', varkStyle: 'visual' })).body.data).toEqual({ mbtiType: 'INTP', varkStyle: 'visual' })
    expect((await put(token, { mbtiType: null, varkStyle: 'reading' })).status).toBe(200)
    expect((await get()).body.data).toEqual({ mbtiType: null, varkStyle: 'reading' })
  })

  it('menolak nilai tidak valid dan tanpa token', async () => {
    const token = await login()
    expect((await put(token, { mbtiType: 'ABCD' })).status).toBe(422)
    expect((await put(token, { varkStyle: 'musik' })).status).toBe(422)
    expect((await request(app).get('/api/me/preferences')).status).toBe(401)
  })
})
