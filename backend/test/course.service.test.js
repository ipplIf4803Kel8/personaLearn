// Uji CourseService (DPPL #2 Eksplorasi Kelas + pengelolaan admin) terhadap DB uji.
import assert from 'node:assert/strict'
import { after, beforeEach, describe, it } from 'node:test'
import 'dotenv/config'
import pool from '../src/config/db.js'
import { courseService as svc } from '../src/services/course.service.js'

assert.match(process.env.DB_NAME, /_test$/, 'DB_NAME harus berakhiran _test')

let u1, u2, catA, catB, js, ui, draft

const rejects = (p, status) => assert.rejects(p, (e) => e.status === status)

beforeEach(async () => {
  await pool.query('TRUNCATE users, categories RESTART IDENTITY CASCADE')
  const user = async (email) =>
    (await pool.query("INSERT INTO users (name, email, password_hash) VALUES ('U', $1, 'x') RETURNING id", [email])).rows[0].id
  u1 = await user('a@test.id')
  u2 = await user('b@test.id')
  const cat = async (name) =>
    (await pool.query('INSERT INTO categories (name, slug) VALUES ($1, $1) RETURNING id', [name])).rows[0].id
  catA = await cat('pemrograman')
  catB = await cat('desain')
  js = await svc.create({ categoryId: catA, title: 'Dasar JavaScript', level: 'Beginner', isPublished: true })
  ui = await svc.create({ categoryId: catB, title: 'Desain UI 100%', level: 'Advanced', isPublished: true })
  draft = await svc.create({ categoryId: catA, title: 'Draft Rahasia', isPublished: false })
  await svc.addLesson(js.id, { title: 'L1', durationSeconds: 600 })
  await svc.addLesson(js.id, { title: 'L2', durationSeconds: 600 })
})

describe('search', () => {
  it('hanya kelas terpublikasi, dengan jumlah pelajaran dan durasi', async () => {
    const all = await svc.search(u1)
    assert.deepEqual(all.map((c) => c.title), ['Dasar JavaScript', 'Desain UI 100%'])
    assert.equal(all[0].lessonsCount, 2)
    assert.equal(all[0].totalDurationSeconds, 1200)
  })

  it('filter judul, kategori, level, durasi', async () => {
    assert.equal((await svc.search(u1, { q: 'javascript' })).length, 1)
    assert.equal((await svc.search(u1, { categoryId: String(catB) })).length, 1)
    assert.equal((await svc.search(u1, { level: 'Advanced' }))[0].title, 'Desain UI 100%')
    assert.deepEqual((await svc.search(u1, { maxDurationMinutes: '10' })).map((c) => c.title), ['Desain UI 100%'])
  })

  it('karakter wildcard di pencarian dianggap teks biasa', async () => {
    assert.equal((await svc.search(u1, { q: '%' })).length, 1) // hanya "100%"
    assert.equal((await svc.search(u1, { q: '_' })).length, 0)
  })

  it('menolak filter tidak valid', async () => {
    await rejects(svc.search(u1, { level: 'Expert' }), 400)
    await rejects(svc.search(u1, { categoryId: 'abc' }), 400)
    await rejects(svc.search(u1, { minRating: '9' }), 400)
    await rejects(svc.search(u1, { sort: 'title; DROP TABLE users' }), 400)
  })

  it('filter rating minimum memakai rata-rata rating', async () => {
    await svc.enroll(u1, js.id)
    await pool.query('UPDATE enrollments SET rating = 4 WHERE user_id = $1', [u1])
    assert.deepEqual((await svc.search(u1, { minRating: '4' })).map((c) => c.id), [js.id])
    assert.equal((await svc.search(u1, { minRating: '5' })).length, 0)
  })
})

describe('getDetail', () => {
  it('berisi pelajaran terurut dan status enroll/favorit milik pengguna', async () => {
    await svc.enroll(u1, js.id)
    const d1 = await svc.getDetail(u1, js.id)
    assert.deepEqual(d1.lessons.map((l) => l.title), ['L1', 'L2'])
    assert.equal(d1.isEnrolled, true)
    assert.equal(d1.isFavorite, false)
    await svc.toggleFavorite(u1, js.id)
    assert.equal((await svc.getDetail(u1, js.id)).isFavorite, true)
    assert.equal((await svc.getDetail(u2, js.id)).isFavorite, false)
    assert.equal((await svc.getDetail(u2, js.id)).isEnrolled, false)
  })

  it('kelas draft atau tidak ada menghasilkan 404', async () => {
    await rejects(svc.getDetail(u1, draft.id), 404)
    await rejects(svc.getDetail(u1, 9999), 404)
    await rejects(svc.getDetail(u1, 'abc'), 400)
  })
})

describe('enroll', () => {
  it('idempotent: kedua kali ditandai alreadyEnrolled, baris tetap satu', async () => {
    assert.equal((await svc.enroll(u1, js.id)).alreadyEnrolled, false)
    assert.equal((await svc.enroll(u1, js.id)).alreadyEnrolled, true)
    assert.equal((await pool.query('SELECT 1 FROM enrollments')).rowCount, 1)
  })

  it('tidak bisa mengambil kelas draft', async () => {
    await rejects(svc.enroll(u1, draft.id), 404)
  })
})

describe('toggleFavorite', () => {
  it('menambah lalu menghapus, per pengguna', async () => {
    assert.equal((await svc.toggleFavorite(u1, js.id)).isFavorite, true)
    assert.deepEqual((await svc.search(u1, { favoritesOnly: 'true' })).map((c) => c.id), [js.id])
    assert.equal((await svc.search(u2, { favoritesOnly: 'true' })).length, 0)
    assert.equal((await svc.toggleFavorite(u1, js.id)).isFavorite, false)
    assert.equal((await svc.search(u1, { favoritesOnly: 'true' })).length, 0)
  })

  it('tidak bisa memfavoritkan kelas draft', async () => {
    await rejects(svc.toggleFavorite(u1, draft.id), 404)
  })
})

describe('create dan addLesson', () => {
  it('validasi wajib isi dan level', async () => {
    await rejects(svc.create({ title: 'tanpa kategori' }), 400)
    await rejects(svc.create({ categoryId: catA, title: '  ' }), 400)
    await rejects(svc.create({ categoryId: catA, title: 'x', level: 'Dewa' }), 400)
    await rejects(svc.create({ categoryId: catA, title: 'x', level: null }), 400)
  })

  it('kolom di luar daftar diabaikan, bukan disisipkan ke SQL', async () => {
    const c = await svc.create({ categoryId: catA, title: 'Aman', 'id; DROP TABLE users': 1, id: 999 })
    assert.notEqual(c.id, 999)
    assert.equal((await pool.query('SELECT 1 FROM users')).rowCount, 2)
  })

  it('addLesson menaikkan position dan menolak kelas tidak ada', async () => {
    const l = await svc.addLesson(ui.id, { title: 'A' })
    const l2 = await svc.addLesson(ui.id, { title: 'B' })
    assert.equal(l2.position, l.position + 1)
    await rejects(svc.addLesson(9999, { title: 'x' }), 404)
    await rejects(svc.addLesson(ui.id, { title: '' }), 400)
  })
})

after(() => pool.end())
