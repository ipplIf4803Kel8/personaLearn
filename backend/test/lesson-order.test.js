// Urutan pelajaran: hapus menomori ulang, reorder menolak id ganda dan id kelas lain
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import 'dotenv/config'
import pool from '../src/config/db.js'

const canUseDb = /_test$/.test(process.env.DB_NAME ?? '')

describe.skipIf(!canUseDb)('urutan pelajaran admin', () => {
  let app, token, adminId, categoryId, courseId, otherCourseId, ids, otherLessonId
  const tag = `ord${Date.now()}`
  const auth = () => ({ Authorization: `Bearer ${token}` })
  const positions = async () =>
    (await pool.query('SELECT position FROM lessons WHERE course_id = $1 ORDER BY position', [courseId])).rows.map((r) => r.position)

  beforeAll(async () => {
    app = (await import('../src/app.js')).default
    adminId = (await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES ('Uji Admin', $1, 'x', 'admin') RETURNING id", [`${tag}@test.id`])).rows[0].id
    token = jwt.sign({ sub: adminId, role: 'admin' }, process.env.JWT_SECRET)
    categoryId = (await pool.query('INSERT INTO categories (name, slug) VALUES ($1, $1) RETURNING id', [tag])).rows[0].id
    const course = async (title) =>
      (await pool.query('INSERT INTO courses (category_id, title, is_published) VALUES ($1, $2, TRUE) RETURNING id', [categoryId, title])).rows[0].id
    courseId = await course(`${tag} a`)
    otherCourseId = await course(`${tag} b`)
    ids = []
    for (const position of [1, 2, 3, 4]) {
      ids.push((await pool.query('INSERT INTO lessons (course_id, title, position) VALUES ($1, $2, $3) RETURNING id', [courseId, `P${position}`, position])).rows[0].id)
    }
    otherLessonId = (await pool.query('INSERT INTO lessons (course_id, title, position) VALUES ($1, $2, 1) RETURNING id', [otherCourseId, 'Lain'])).rows[0].id
  })

  afterAll(async () => {
    await pool.query('DELETE FROM courses WHERE id = ANY($1)', [[courseId, otherCourseId]])
    await pool.query('DELETE FROM categories WHERE id = $1', [categoryId])
    await pool.query('DELETE FROM users WHERE id = $1', [adminId])
  })

  it('reorder menolak id ganda dan id milik kelas lain', async () => {
    const reorder = (list) => request(app).patch(`/api/admin/courses/${courseId}/lessons/reorder`).set(auth()).send({ ids: list })
    expect((await reorder([ids[0], ids[0]])).status).toBe(422)
    expect((await reorder([ids[0], otherLessonId])).status).toBe(422)
    expect((await reorder([ids[3], ids[2], ids[1], ids[0]])).status).toBe(204)
    expect(await positions()).toEqual([1, 2, 3, 4])
  })

  it('hapus pelajaran menomori ulang posisi tanpa celah', async () => {
    const res = await request(app).delete(`/api/admin/lessons/${ids[1]}`).set(auth())
    expect(res.status).toBe(204)
    expect(await positions()).toEqual([1, 2, 3])
  })
})
