import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import 'dotenv/config'

if (!/_test$/.test(process.env.DB_NAME ?? '')) throw new Error('DB_NAME harus berakhiran _test')
process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'persona-upload-'))

const { default: app } = await import('../src/app.js')
const { default: pool } = await import('../src/config/db.js')
const { signToken, hashPassword, verifyPassword } = await import('../src/utils/security.js')

const tag = `prf${Date.now()}`
const emailOf = (n) => `${n}.${tag}@test.id`
let u, other, token
const auth = () => ({ Authorization: `Bearer ${token}` })
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)])

beforeAll(async () => {
  const hash = await hashPassword('rahasia123')
  const add = async (n) =>
    (await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'student') RETURNING id, role", [n, emailOf(n), hash])).rows[0]
  u = await add('siswa')
  other = await add('lain')
  token = signToken(u)
})
afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id = ANY($1)', [[u.id, other.id]])
  await pool.end()
  fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true })
})

describe('profil', () => {
  it('menolak tanpa token', async () => {
    expect((await request(app).get('/api/me/profile')).status).toBe(401)
  })

  it('membaca dan mengubah profil', async () => {
    const get = await request(app).get('/api/me/profile').set(auth())
    expect(get.body.data).toMatchObject({ name: 'siswa', email: emailOf('siswa') })
    const put = await request(app).put('/api/me/profile').set(auth())
      .send({ name: '  Budi  ', email: emailOf('Budi'), phone: '+62 812-3456-7890' })
    expect(put.status).toBe(200)
    expect(put.body.data).toMatchObject({ name: 'Budi', email: emailOf('budi'), phone: '+62 812-3456-7890' })
  })

  it('validasi nama, email, telepon, dan field asing', async () => {
    const put = (body) => request(app).put('/api/me/profile').set(auth()).send(body)
    expect((await put({ name: '', email: emailOf('x') })).body.errors.name).toBeTruthy()
    expect((await put({ name: 'A', email: 'salah' })).body.errors.email).toBeTruthy()
    expect((await put({ name: 'A', email: emailOf('x'), phone: 'abc' })).body.errors.phone).toBeTruthy()
    expect((await put({ name: 'A', email: emailOf('x'), role: 'admin' })).status).toBe(422)
  })

  it('menolak email yang sudah dipakai pengguna lain', async () => {
    const res = await request(app).put('/api/me/profile').set(auth()).send({ name: 'A', email: emailOf('lain') })
    expect(res.status).toBe(409)
    expect(res.body.errors.email).toBeTruthy()
  })
})

describe('ganti kata sandi', () => {
  const put = (body) => request(app).put('/api/me/password').set(auth()).send(body)

  it('menolak kata sandi lama yang salah', async () => {
    const res = await put({ oldPassword: 'salahsalah1', newPassword: 'barubaru123' })
    expect(res.status).toBe(422)
    expect(res.body.errors.oldPassword).toBeTruthy()
  })

  it('menolak kata sandi baru yang lemah atau sama dengan lama', async () => {
    expect((await put({ oldPassword: 'rahasia123', newPassword: 'pendek1' })).body.errors.newPassword).toBeTruthy()
    expect((await put({ oldPassword: 'rahasia123', newPassword: 'hurufsaja' })).status).toBe(422)
    expect((await put({ oldPassword: 'rahasia123', newPassword: 'rahasia123' })).status).toBe(422)
  })

  it('menerima kata sandi lama yang benar dan menyimpan hash baru', async () => {
    const res = await put({ oldPassword: 'rahasia123', newPassword: 'barubaru123' })
    expect(res.status).toBe(200)
    token = res.body.data.token // token lama dicabut, token baru dikirim di respons
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [u.id])
    expect(await verifyPassword('barubaru123', rows[0].password_hash)).toBe(true)
    expect(await verifyPassword('rahasia123', rows[0].password_hash)).toBe(false)
  })
})

describe('foto profil', () => {
  const upload = (buf, name, type) =>
    request(app).post('/api/me/avatar').set(auth()).attach('avatar', buf, { filename: name, contentType: type })

  it('menolak tipe file yang salah, walau ekstensinya gambar', async () => {
    expect((await upload(Buffer.from('<?php echo 1 ?>'), 'x.png', 'image/png')).status).toBe(422)
    expect((await upload(Buffer.from('%PDF-1.4'), 'x.pdf', 'application/pdf')).status).toBe(422)
    expect((await request(app).post('/api/me/avatar').set(auth())).status).toBe(422)
  })

  it('menolak file lebih dari 2 MB', async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)])
    expect((await upload(big, 'big.png', 'image/png')).status).toBe(413)
  })

  it('menyimpan PNG dengan nama acak dan menyajikannya lewat /uploads', async () => {
    const res = await upload(PNG, 'foto-saya.png', 'image/png')
    expect(res.status).toBe(200)
    const url = res.body.data.avatarUrl
    expect(url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.png$/)
    expect(url).not.toContain('foto-saya')
    const served = await request(app).get(url)
    expect(served.status).toBe(200)
    const again = await upload(PNG, 'a.png', 'image/png')
    expect(fs.existsSync(path.join(process.env.UPLOAD_DIR, path.basename(url)))).toBe(false)
    expect(again.body.data.avatarUrl).not.toBe(url)
  })

  it('DELETE /me/avatar menghapus file dan mengosongkan avatarUrl', async () => {
    const url = (await upload(PNG, 'a.png', 'image/png')).body.data.avatarUrl
    const res = await request(app).delete('/api/me/avatar').set(auth())
    expect(res.status).toBe(200)
    expect(res.body.data.avatarUrl).toBeNull()
    expect(fs.existsSync(path.join(process.env.UPLOAD_DIR, path.basename(url)))).toBe(false)
    expect((await request(app).delete('/api/me/avatar')).status).toBe(401)
  })
})
