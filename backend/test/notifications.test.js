// Dijalankan terhadap DB uji (DB_NAME berakhiran _test). Data dibuat dengan email unik dan dibersihkan sendiri
// supaya aman berjalan bersamaan dengan file test lain.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import 'dotenv/config'

if (!/_test$/.test(process.env.DB_NAME ?? '')) throw new Error('DB_NAME harus berakhiran _test')

const { default: app } = await import('../src/app.js')
const { default: pool } = await import('../src/config/db.js')
const { signToken, hashPassword } = await import('../src/utils/security.js')
const { notificationService } = await import('../src/services/NotificationService.js')

const tag = `ntf${Date.now()}`
let a, b, tokenA, tokenB

const addUser = async (name) => {
  const { rows } = await pool.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'student') RETURNING id, role",
    [name, `${name}.${tag}@test.id`, await hashPassword('rahasia123')]
  )
  return rows[0]
}
const seed = (userId, n) =>
  pool.query(
    `INSERT INTO notifications (user_id, type, title, body)
     SELECT $1, 'info', 'Judul ' || g, 'Isi ' || g FROM generate_series(1, $2) g`,
    [userId, n]
  )
const auth = (t) => ({ Authorization: `Bearer ${t}` })

beforeAll(async () => {
  a = await addUser('a')
  b = await addUser('b')
  tokenA = signToken(a)
  tokenB = signToken(b)
})
afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id = ANY($1)', [[a.id, b.id]])
  await pool.end()
})

describe('notifikasi pelajar', () => {
  it('menolak tanpa token', async () => {
    expect((await request(app).get('/api/notifications')).status).toBe(401)
  })

  it('daftar dipaginasi dan menghitung belum dibaca', async () => {
    await seed(a.id, 5)
    const res = await request(app).get('/api/notifications?page=2&limit=2').set(auth(tokenA))
    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({ page: 2, limit: 2, total: 5, unread: 5 })
    expect(res.body.data.items).toHaveLength(2)
    expect((await request(app).get('/api/notifications?limit=999').set(auth(tokenA))).status).toBe(422)
  })

  it('menandai satu notifikasi dibaca', async () => {
    const { rows } = await pool.query('SELECT id FROM notifications WHERE user_id = $1 LIMIT 1', [a.id])
    const res = await request(app).patch(`/api/notifications/${rows[0].id}/read`).set(auth(tokenA))
    expect(res.status).toBe(200)
    expect(res.body.data.isRead).toBe(true)
    const list = await request(app).get('/api/notifications').set(auth(tokenA))
    expect(list.body.data.unread).toBe(4)
  })

  it('read-all menandai semuanya dibaca', async () => {
    const res = await request(app).patch('/api/notifications/read-all').set(auth(tokenA))
    expect(res.status).toBe(200)
    expect(res.body.data.updated).toBe(4)
    const list = await request(app).get('/api/notifications').set(auth(tokenA))
    expect(list.body.data.unread).toBe(0)
  })

  it('pelajar tidak bisa mengakses atau mengubah notifikasi milik orang lain', async () => {
    const { rows } = await pool.query('SELECT id FROM notifications WHERE user_id = $1 LIMIT 1', [a.id])
    const id = rows[0].id
    expect((await request(app).get(`/api/notifications/${id}`).set(auth(tokenB))).status).toBe(404)
    expect((await request(app).patch(`/api/notifications/${id}/read`).set(auth(tokenB))).status).toBe(404)
    const mine = await request(app).get('/api/notifications').set(auth(tokenB))
    expect(mine.body.data.total).toBe(0)
    await seed(b.id, 1)
    await request(app).patch('/api/notifications/read-all').set(auth(tokenA))
    const other = await request(app).get('/api/notifications').set(auth(tokenB))
    expect(other.body.data.unread).toBe(1)
  })

  it('pengaturan dibuat default lalu bisa diubah dengan validasi', async () => {
    const first = await request(app).get('/api/me/notification-settings').set(auth(tokenA))
    expect(first.body.data).toEqual({
      reminderEnabled: true, reminderTime: '19:00', frequency: 'harian', allowPromo: true, allowChallenge: true,
    })
    const next = { reminderEnabled: false, reminderTime: '07:30', frequency: 'mingguan', allowPromo: false, allowChallenge: true }
    const put = await request(app).put('/api/me/notification-settings').set(auth(tokenA)).send(next)
    expect(put.status).toBe(200)
    expect(put.body.data).toEqual(next)
    const bad = await request(app).put('/api/me/notification-settings').set(auth(tokenA)).send({ ...next, frequency: 'bulanan' })
    expect(bad.status).toBe(422)
    expect(bad.body.errors.frequency).toBeTruthy()
    const otherUser = await request(app).get('/api/me/notification-settings').set(auth(tokenB))
    expect(otherUser.body.data.reminderTime).toBe('19:00')
  })

  it('create menghormati pengaturan promo dan tantangan', async () => {
    await request(app).put('/api/me/notification-settings').set(auth(tokenA))
      .send({ reminderEnabled: true, reminderTime: '19:00', frequency: 'harian', allowPromo: false, allowChallenge: false })
    expect(await notificationService.create(a.id, { type: 'promo', title: 'Diskon', body: 'x' })).toBeNull()
    expect(await notificationService.create(a.id, { type: 'challenge', title: 'Tantangan', body: 'x' })).toBeNull()
    expect(await notificationService.create(a.id, { type: 'reminder', title: 'Belajar', body: 'x' })).not.toBeNull()
    expect(await notificationService.create(b.id, { type: 'promo', title: 'Diskon', body: 'x' })).not.toBeNull()
  })
})
