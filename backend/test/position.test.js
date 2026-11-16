// Uji posisi terakhir video. Hanya jalan bila DB_NAME berakhiran _test, mis. npm test
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import 'dotenv/config'
import pool from '../src/config/db.js'

const canUseDb = /_test$/.test(process.env.DB_NAME ?? '')

describe.skipIf(!canUseDb)('PUT /api/lessons/:id/position', () => {
  let app, token, otherToken, lessonIds, userId, otherId
  const tag = `pos${Date.now()}`
  const auth = (t = token) => ({ Authorization: `Bearer ${t}` })
  const put = (id, body, t) => request(app).put(`/api/lessons/${id}/position`).set(auth(t)).send(body)
  const row = async (id, uid = userId) =>
    (await pool.query('SELECT completed_at, last_position_seconds FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2', [uid, id])).rows[0]

  beforeAll(async () => {
    app = (await import('../src/app.js')).default
    const user = async (n) =>
      (await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, 'x', 'student') RETURNING id", [`Uji ${n}`, `${tag}${n}@test.id`])).rows[0].id
    userId = await user(1)
    otherId = await user(2)
    const sign = (id) => jwt.sign({ sub: id, role: 'student' }, process.env.JWT_SECRET)
    token = sign(userId)
    otherToken = sign(otherId)
    const cat = (await pool.query('INSERT INTO categories (name, slug) VALUES ($1, $1) RETURNING id', [tag])).rows[0].id
    const courseId = (await pool.query('INSERT INTO courses (category_id, title, is_published) VALUES ($1, $2, TRUE) RETURNING id', [cat, tag])).rows[0].id
    lessonIds = []
    for (const position of [1, 2]) {
      lessonIds.push((await pool.query('INSERT INTO lessons (course_id, title, position, duration_seconds) VALUES ($1, $2, $3, 600) RETURNING id', [courseId, `P${position}`, position])).rows[0].id)
    }
    await pool.query('INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)', [userId, courseId])
  })

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email LIKE $1', [`${tag}%`])
    await pool.query('DELETE FROM courses WHERE title = $1', [tag])
    await pool.query('DELETE FROM categories WHERE name = $1', [tag])
    await pool.end()
  })

  it('menyimpan posisi, tanpa menandai selesai, progres dan poin tidak berubah', async () => {
    const res = await put(lessonIds[0], { positionSeconds: 123 })
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual({ lessonId: lessonIds[0], lastPositionSeconds: 123 })
    expect(await row(lessonIds[0])).toMatchObject({ completed_at: null, last_position_seconds: 123 })
    const detail = await request(app).get(`/api/lessons/${lessonIds[0]}`).set(auth())
    expect(detail.body.data).toMatchObject({ completed: false, lastPositionSeconds: 123 })
    const { body } = await request(app).get('/api/me/enrollments').set(auth())
    expect(body.data[0]).toMatchObject({ completedLessons: 0, progressPercent: 0 })
    const stats = await request(app).get('/api/me/stats').set(auth())
    expect(stats.body.data).toMatchObject({ totalPoints: 0, currentStreak: 0, activity: [] })
    expect((await pool.query('SELECT 1 FROM point_transactions WHERE user_id = $1', [userId])).rowCount).toBe(0)
  })

  it('menerima nol dan menimpa posisi sebelumnya', async () => {
    expect((await put(lessonIds[0], { positionSeconds: 0 })).status).toBe(200)
    expect((await row(lessonIds[0])).last_position_seconds).toBe(0)
  })

  it('menolak negatif, pecahan, string, kosong, dan kolom tambahan', async () => {
    for (const body of [{ positionSeconds: -1 }, { positionSeconds: 1.5 }, { positionSeconds: '10' }, {}, { positionSeconds: 5, x: 1 }]) {
      expect((await put(lessonIds[0], body)).status).toBe(422)
    }
  })

  it('403 bila belum mengambil kelas dan tidak membuat baris, 401 tanpa token', async () => {
    expect((await put(lessonIds[0], { positionSeconds: 5 }, otherToken)).status).toBe(403)
    expect(await row(lessonIds[0], otherId)).toBeUndefined()
    expect((await request(app).put(`/api/lessons/${lessonIds[0]}/position`).send({ positionSeconds: 5 })).status).toBe(401)
  })

  it('tidak menimpa completed_at pelajaran yang sudah selesai', async () => {
    await request(app).post(`/api/lessons/${lessonIds[1]}/complete`).set(auth()).send({ positionSeconds: 590 })
    const before = await row(lessonIds[1])
    expect((await put(lessonIds[1], { positionSeconds: 30 })).status).toBe(200)
    const after = await row(lessonIds[1])
    expect(after.completed_at).toEqual(before.completed_at)
    expect(after.last_position_seconds).toBe(30)
    const { body } = await request(app).get('/api/me/enrollments').set(auth())
    expect(body.data[0]).toMatchObject({ completedLessons: 1, progressPercent: 50 })
  })
})
