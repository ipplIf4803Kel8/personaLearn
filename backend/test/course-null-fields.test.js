// Admin boleh mengirim sampul dan deskripsi null (form kosong); disimpan sebagai string kosong
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import 'dotenv/config'
import pool from '../src/config/db.js'

const canUseDb = /_test$/.test(process.env.DB_NAME ?? '')

describe.skipIf(!canUseDb)('POST /api/admin/courses dengan field null', () => {
  let app, token, adminId, categoryId, courseId
  const tag = `nul${Date.now()}`

  beforeAll(async () => {
    app = (await import('../src/app.js')).default
    adminId = (await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES ('Uji Admin', $1, 'x', 'admin') RETURNING id", [`${tag}@test.id`])).rows[0].id
    token = jwt.sign({ sub: adminId, role: 'admin' }, process.env.JWT_SECRET)
    categoryId = (await pool.query('INSERT INTO categories (name, slug) VALUES ($1, $1) RETURNING id', [tag])).rows[0].id
  })

  afterAll(async () => {
    if (courseId) await pool.query('DELETE FROM courses WHERE id = $1', [courseId])
    await pool.query('DELETE FROM categories WHERE id = $1', [categoryId])
    await pool.query('DELETE FROM users WHERE id = $1', [adminId])
  })

  it('menyimpan thumbnailUrl dan description null sebagai string kosong', async () => {
    const res = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ categoryId, title: tag, level: 'Beginner', thumbnailUrl: null, description: null, isPublished: false })
    expect(res.status).toBe(201)
    courseId = res.body.id ?? res.body.data?.id
    const row = (await pool.query('SELECT thumbnail_url, description FROM courses WHERE id = $1', [courseId])).rows[0]
    expect(row).toEqual({ thumbnail_url: '', description: '' })
  })
})
