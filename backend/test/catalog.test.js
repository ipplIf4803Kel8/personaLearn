// Integration test endpoint katalog: enroll, rating, favorit, daftar, dan rekomendasi.
import assert from 'node:assert/strict'
import { afterAll, beforeEach, describe, it } from 'vitest'
import request from 'supertest'
import 'dotenv/config'
import pool from '../src/config/db.js'
import app from '../src/app.js'
import { signToken } from '../src/utils/security.js'

assert.match(process.env.DB_NAME, /_test$/, 'DB_NAME harus berakhiran _test')

let user, other, catA, catB, a, b, c, draft
const auth = (u) => ({ Authorization: `Bearer ${signToken(u)}` })
const get = (path, u = user) => request(app).get(`/api${path}`).set(auth(u))
const post = (path, body, u = user) => request(app).post(`/api${path}`).set(auth(u)).send(body)

async function insertCourse(categoryId, title, published, tags = {}) {
  const { rows } = await pool.query('INSERT INTO courses (category_id, title, level, is_published) VALUES ($1, $2, $3, $4) RETURNING id', [categoryId, title, 'Beginner', published])
  for (const [type, values] of Object.entries(tags)) {
    for (const v of values) await pool.query('INSERT INTO course_tags (course_id, tag_type, tag_value) VALUES ($1, $2, $3)', [rows[0].id, type, v])
  }
  return rows[0].id
}

beforeEach(async () => {
  await pool.query('TRUNCATE users, categories RESTART IDENTITY CASCADE')
  const mk = async (email) =>
    (await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES ('U', $1, 'x', 'student') RETURNING id, role", [email])).rows[0]
  user = await mk('a@test.id')
  other = await mk('b@test.id')
  catA = (await pool.query("INSERT INTO categories (name, slug) VALUES ('Pemrograman', 'pemrograman') RETURNING id")).rows[0].id
  catB = (await pool.query("INSERT INTO categories (name, slug) VALUES ('Desain', 'desain') RETURNING id")).rows[0].id
  a = await insertCourse(catA, 'Kelas A', true, { vark: ['visual'], personality: ['structured'] })
  b = await insertCourse(catB, 'Kelas B', true, { vark: ['auditory'], personality: ['exploratory'] })
  c = await insertCourse(catA, 'Kelas C', true, { vark: ['reading'] })
  draft = await insertCourse(catA, 'Draf', false)
  // Kelas tanpa pelajaran tidak tampil untuk pelajar, jadi beri satu pelajaran di posisi akhir
  for (const id of [a, b, c]) await pool.query("INSERT INTO lessons (course_id, title, position) VALUES ($1, 'Pengisi', 100)", [id])
})

afterAll(() => pool.end())

describe('autentikasi dan validasi', () => {
  it('menolak tanpa token', async () => {
    assert.equal((await request(app).get('/api/courses')).status, 401)
  })

  it('id tidak valid dan query tidak dikenal menghasilkan 422', async () => {
    assert.equal((await get('/courses/abc')).status, 422)
    assert.equal((await get('/courses?foo=1')).status, 422)
    assert.equal((await get('/courses?sort=title')).status, 422)
  })
})

describe('GET /categories dan /courses', () => {
  it('GET /categories hanya memuat kategori yang punya kelas terbit berpelajaran', async () => {
    const kosong = (await pool.query("INSERT INTO categories (name, slug) VALUES ('Kosong', 'kosong') RETURNING id")).rows[0].id
    const tanpaPelajaran = (await pool.query("INSERT INTO categories (name, slug) VALUES ('Tanpa Pelajaran', 'tanpa-pelajaran') RETURNING id")).rows[0].id
    await insertCourse(tanpaPelajaran, 'Kelas Kosong', true)
    const names = (await get('/categories')).body.data.map((x) => x.name)
    assert.deepEqual(names, ['Desain', 'Pemrograman'])
    assert.ok(kosong)
  })

  it('mengembalikan kategori dan daftar kelas terbit dengan meta', async () => {
    assert.equal((await get('/categories')).body.data.length, 2)
    const res = await get('/courses?limit=2&page=1')
    assert.equal(res.status, 200)
    assert.equal(res.body.data.length, 2)
    assert.deepEqual(res.body.meta, { page: 1, limit: 2, total: 3 })
    const page2 = await get('/courses?limit=2&page=2')
    assert.equal(page2.body.data.length, 1)
  })

  it('filter category dan search', async () => {
    assert.equal((await get(`/courses?category=${catB}`)).body.data.length, 1)
    assert.equal((await get('/courses?search=kelas%20c')).body.data[0].title, 'Kelas C')
  })

  it('popular mengurutkan dari jumlah peserta terbanyak', async () => {
    await post(`/courses/${b}/enroll`)
    await post(`/courses/${b}/enroll`, undefined, other)
    await post(`/courses/${a}/enroll`)
    const res = await get('/courses/popular')
    assert.deepEqual(res.body.data.map((x) => x.id).slice(0, 2), [b, a])
  })
})

describe('POST /courses/:id/enroll', () => {
  it('201 saat pertama, 200 alreadyEnrolled saat kedua', async () => {
    const first = await post(`/courses/${a}/enroll`)
    assert.equal(first.status, 201)
    assert.equal(first.body.data.alreadyEnrolled, false)
    const second = await post(`/courses/${a}/enroll`)
    assert.equal(second.status, 200)
    assert.equal(second.body.data.alreadyEnrolled, true)
    assert.equal((await get(`/courses/${a}`)).body.data.isEnrolled, true)
  })

  it('404 untuk kelas draf atau tidak ada', async () => {
    assert.equal((await post(`/courses/${draft}/enroll`)).status, 404)
    assert.equal((await post('/courses/9999/enroll')).status, 404)
  })
})

describe('POST /courses/:id/rating', () => {
  it('403 jika belum mengambil kelas', async () => {
    assert.equal((await post(`/courses/${a}/rating`, { rating: 5 })).status, 403)
  })

  it('422 untuk rating di luar 1-5 atau field tidak dikenal', async () => {
    await post(`/courses/${a}/enroll`)
    assert.equal((await post(`/courses/${a}/rating`, { rating: 0 })).status, 422)
    assert.equal((await post(`/courses/${a}/rating`, { rating: 6 })).status, 422)
    assert.equal((await post(`/courses/${a}/rating`, { rating: 4.5 })).status, 422)
    assert.equal((await post(`/courses/${a}/rating`, { rating: 3, extra: 1 })).status, 422)
  })

  it('upsert: rating kedua menimpa, rata-rata dihitung dari semua pelajar', async () => {
    await post(`/courses/${a}/enroll`)
    await post(`/courses/${a}/enroll`, undefined, other)
    await post(`/courses/${a}/rating`, { rating: 2 })
    const res = await post(`/courses/${a}/rating`, { rating: 5, review: 'Bagus' })
    assert.equal(res.status, 200)
    assert.equal(res.body.data.ratingsCount, 1)
    await post(`/courses/${a}/rating`, { rating: 3 }, other)
    const detail = (await get(`/courses/${a}`)).body.data
    assert.equal(detail.rating, 4)
    assert.equal(detail.myRating, 5)
    assert.equal((await pool.query('SELECT 1 FROM course_ratings')).rowCount, 2)
  })
})

describe('favorit', () => {
  it('POST menambah, DELETE menghapus, keduanya idempotent', async () => {
    assert.equal((await post(`/courses/${a}/favorite`)).body.data.isFavorite, true)
    assert.equal((await post(`/courses/${a}/favorite`)).status, 200)
    assert.equal((await get('/courses?favoritesOnly=true')).body.data.length, 1)
    const del = await request(app).delete(`/api/courses/${a}/favorite`).set(auth(user))
    assert.equal(del.body.data.isFavorite, false)
    assert.equal((await get('/courses?favoritesOnly=true')).body.data.length, 0)
  })
})

describe('GET /courses/recommended', () => {
  it('tanpa preferensi mengembalikan kelas populer yang belum diambil', async () => {
    await post(`/courses/${b}/enroll`, undefined, other)
    await post(`/courses/${a}/enroll`)
    const res = await get('/courses/recommended')
    assert.equal(res.status, 200)
    assert.deepEqual(res.body.data.map((x) => x.id).sort(), [b, c].sort())
    assert.equal(res.body.data[0].id, b)
  })

  it('dengan preferensi: VARK dan MBTI menentukan urutan, kelas diambil tidak muncul', async () => {
    await pool.query("INSERT INTO learning_preferences (user_id, mbti_type, vark_style) VALUES ($1, 'ENFP', 'auditory')", [user.id])
    const res = await get('/courses/recommended')
    assert.equal(res.body.data[0].id, b)
    assert.ok(res.body.data[0].score > res.body.data[1].score)
    await post(`/courses/${b}/enroll`)
    const after = (await get('/courses/recommended')).body.data.map((x) => x.id)
    assert.ok(!after.includes(b) && !after.includes(draft))
  })
})

describe('GET /courses/:id/preview', () => {
  it('mengembalikan pelajaran pertama tanpa mengambil kelas', async () => {
    await pool.query(
      "INSERT INTO lessons (course_id, title, description, video_url, position) VALUES ($1, 'Kedua', 'd2', 'v2', 2), ($1, 'Pertama', 'd1', 'v1', 1)",
      [a]
    )
    const res = await get(`/courses/${a}/preview`)
    assert.equal(res.status, 200)
    assert.equal(res.body.data.title, 'Pertama')
    assert.equal(res.body.data.videoUrl, 'v1')
    assert.deepEqual(Object.keys(res.body.data).sort(), ['description', 'durationSeconds', 'lessonId', 'title', 'videoUrl'])
  })

  it('404 untuk kelas tanpa pelajaran, draf, atau id tidak ada; 422 untuk id tidak valid', async () => {
    await pool.query("INSERT INTO lessons (course_id, title, position) VALUES ($1, 'L', 1)", [draft])
    const empty = await insertCourse(catA, 'Kosong', true)
    assert.equal((await get(`/courses/${empty}/preview`)).status, 404)
    assert.equal((await get(`/courses/${draft}/preview`)).status, 404)
    assert.equal((await get('/courses/9999/preview')).status, 404)
    assert.equal((await get('/courses/abc/preview')).status, 422)
  })
})
