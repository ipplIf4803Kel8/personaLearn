// Uji API terhadap database terpisah (lihat script "test"). Jangan jalankan ke DB utama:
// beforeEach menghapus semua data.
import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import 'dotenv/config'
import pool from '../src/config/db.js'
import app from '../src/app.js'
import { hashPassword, signToken } from '../src/services/auth.service.js'

assert.match(process.env.DB_NAME, /_test$/, 'DB_NAME harus berakhiran _test')

let server, base, admin, student

const call = async (path, { method = 'GET', body, token } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  })
  return { status: res.status, body: res.status === 204 ? null : await res.json() }
}
const as = (user) => signToken(user)

before(() => {
  server = app.listen(0)
  base = `http://localhost:${server.address().port}/api`
})
after(async () => {
  server.close()
  await pool.end()
})
beforeEach(async () => {
  await pool.query('TRUNCATE users, categories, notifications, challenges RESTART IDENTITY CASCADE')
  const hash = hashPassword('rahasia123')
  const ins = (name, email, role) =>
    pool.query('INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING *', [name, email, hash, role])
  admin = (await ins('Admin', 'admin@test.id', 'admin')).rows[0]
  student = (await ins('Siswa', 'siswa@test.id', 'student')).rows[0]
})

describe('autentikasi dan otorisasi', () => {
  it('menolak tanpa token, token palsu, dan non-admin', async () => {
    assert.equal((await call('/admin/stats')).status, 401)
    assert.equal((await call('/admin/stats', { token: 'bukan-token' })).status, 401)
    assert.equal((await call('/admin/stats', { token: as(student) })).status, 403)
    assert.equal((await call('/admin/stats', { token: as(admin) })).status, 200)
  })

  it('token akun yang dinonaktifkan langsung tidak berlaku', async () => {
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = $1', [admin.id])
    assert.equal((await call('/admin/stats', { token: as(admin) })).status, 401)
  })

  it('role dibaca dari DB, bukan dari token lama', async () => {
    const stale = as(admin)
    await pool.query("UPDATE users SET role = 'student' WHERE id = $1", [admin.id])
    assert.equal((await call('/admin/stats', { token: stale })).status, 403)
  })

  it('login membatasi percobaan beruntun', async () => {
    const codes = []
    for (let i = 0; i < 12; i++) {
      codes.push((await call('/auth/login', { method: 'POST', body: { email: 'x@test.id', password: 'salah' } })).status)
    }
    assert.equal(codes[0], 401)
    assert.equal(codes.at(-1), 429)
  })
})

describe('validasi input', () => {
  it('id non-angka dan teks kepanjangan menghasilkan 400, bukan 500', async () => {
    const token = as(admin)
    assert.equal((await call('/admin/categories/abc', { method: 'DELETE', token })).status, 400)
    const r = await call('/admin/notifications', { method: 'POST', token, body: { title: 'x'.repeat(300), body: 'b' } })
    assert.equal(r.status, 400)
  })

  it('reorder menolak ids bukan bilangan bulat', async () => {
    const r = await call('/admin/courses/1/lessons/reorder', {
      method: 'PATCH', token: as(admin), body: { ids: ['1; DROP TABLE users'] },
    })
    assert.equal(r.status, 400)
  })

  it('tantangan dengan tanggal berakhir sebelum mulai ditolak', async () => {
    const r = await call('/admin/challenges', {
      method: 'POST', token: as(admin), body: { title: 't', startsAt: '2026-02-02', endsAt: '2026-02-01' },
    })
    assert.equal(r.status, 400)
  })
})

describe('notifikasi', () => {
  it('kirim lalu hapus', async () => {
    const token = as(admin)
    const created = await call('/admin/notifications', { method: 'POST', token, body: { title: 'Halo', body: 'Isi' } })
    assert.equal(created.status, 201)
    assert.equal((await call(`/admin/notifications/${created.body.id}`, { method: 'DELETE', token })).status, 204)
    assert.equal((await call(`/admin/notifications/${created.body.id}`, { method: 'DELETE', token })).status, 404)
    assert.deepEqual((await call('/admin/notifications', { token })).body, [])
  })
})

describe('laporan', () => {
  it('menghitung aktivitas hanya pada rentang tanggal', async () => {
    await pool.query(
      "INSERT INTO chat_messages (user_id, message, created_at) VALUES ($1,'a','2026-01-10'), ($1,'b','2026-03-10')",
      [student.id]
    )
    const token = as(admin)
    assert.equal((await call('/admin/reports', { token })).body.period.chatMessages, 2)
    assert.equal((await call('/admin/reports?from=2026-01-01&to=2026-01-31', { token })).body.period.chatMessages, 1)
    const edge = await call('/admin/reports?from=2026-01-10&to=2026-01-10', { token })
    assert.equal(edge.body.period.chatMessages, 1, 'tanggal akhir inklusif')
  })

  it('menolak rentang tidak valid', async () => {
    const token = as(admin)
    for (const q of ['from=kemarin', 'from=2026-02-01&to=2026-01-01', 'from=2026-13-45']) {
      assert.equal((await call(`/admin/reports?${q}`, { token })).status, 400, q)
    }
  })
})
