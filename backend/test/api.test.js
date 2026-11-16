// Uji API admin dan keamanan dasar terhadap database uji (DB_NAME berakhiran _test).
// Setiap test mulai dari data kosong; file test dijalankan berurutan (lihat script "test").
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import 'dotenv/config'
import pool from '../src/config/db.js'
import app from '../src/app.js'
import { hashPassword, signToken } from '../src/utils/security.js'

if (!/_test$/.test(process.env.DB_NAME ?? '')) throw new Error('DB_NAME harus berakhiran _test')

let admin, student, other
const as = (user) => ({ Authorization: `Bearer ${signToken(user)}` })
const api = (method, path, user = admin) => request(app)[method](`/api${path}`).set(as(user))

const addUser = async (name, email, role) =>
  (await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING *', [name, email, hashPassword('rahasia123'), role])).rows[0]

beforeEach(async () => {
  await pool.query('TRUNCATE users, categories, notification_broadcasts, challenges RESTART IDENTITY CASCADE')
  admin = await addUser('Admin', 'admin@test.id', 'admin')
  student = await addUser('Siswa', 'siswa@test.id', 'student')
  other = await addUser('Budi', 'budi@test.id', 'student')
})
afterAll(() => pool.end())

describe('autentikasi dan otorisasi', () => {
  it('menolak tanpa token, token palsu, dan non-admin', async () => {
    expect((await request(app).get('/api/admin/stats')).status).toBe(401)
    expect((await request(app).get('/api/admin/stats').set('Authorization', 'Bearer palsu')).status).toBe(401)
    expect((await api('get', '/admin/stats', student)).status).toBe(403)
    expect((await api('get', '/admin/stats')).status).toBe(200)
  })

  it('token akun yang dinonaktifkan langsung tidak berlaku', async () => {
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = $1', [admin.id])
    expect((await api('get', '/admin/stats')).status).toBe(401)
  })

  it('role dibaca dari DB, bukan dari token lama', async () => {
    const stale = as(admin)
    await pool.query("UPDATE users SET role = 'student' WHERE id = $1", [admin.id])
    expect((await request(app).get('/api/admin/stats').set(stale)).status).toBe(403)
  })

  it('semua rute selain health dan auth publik butuh token', async () => {
    const open = ['/health']
    const routes = ['/me/stats', '/me/profile', '/me/preferences', '/courses', '/categories', '/notifications', '/chat/messages', '/challenges/active', '/lessons/1', '/admin/students']
    for (const path of routes) expect((await request(app).get(`/api${path}`)).status, path).toBe(401)
    expect((await request(app).get(`/api${open[0]}`)).status).toBe(200)
  })

  it('login membatasi percobaan beruntun', async () => {
    const codes = []
    for (let i = 0; i < 12; i++) {
      codes.push((await request(app).post('/api/auth/login').send({ email: 'x@test.id', password: 'salah' })).status)
    }
    expect(codes[0]).toBe(401)
    expect(codes.at(-1)).toBe(429)
  })

  it('lupa dan atur ulang kata sandi punya pembatas sendiri', async () => {
    const forgot = []
    for (let i = 0; i < 7; i++) forgot.push((await request(app).post('/api/auth/forgot-password').send({ email: 'tidakada@test.id' })).status)
    expect(forgot[0]).toBe(200)
    expect(forgot.at(-1)).toBe(429)
    const reset = await request(app).post('/api/auth/reset-password').send({ email: 'tidakada@test.id', otp: '123456', password: 'rahasia123' })
    expect(reset.status).toBe(400)
  })

  it('respons tidak pernah memuat password_hash', async () => {
    const paths = ['/auth/me', '/me/profile', '/me/preferences']
    for (const path of paths) expect(JSON.stringify((await api('get', path, student)).body)).not.toMatch(/password|hash/i)
    const list = await api('get', '/admin/students')
    const detail = await api('get', `/admin/students/${student.id}`)
    expect(JSON.stringify([list.body, detail.body])).not.toMatch(/password|hash/i)
    expect((await api('get', '/auth/me', student)).body.name).toBe('Siswa')
  })
})

describe('validasi input admin', () => {
  it('id bukan angka dan field asing ditolak 422, bukan 500', async () => {
    expect((await api('delete', '/admin/categories/abc')).status).toBe(422)
    const r = await api('post', '/admin/categories').send({ name: 'A', slug: 'a', hack: 1 })
    expect(r.status).toBe(422)
    expect(r.body.errors).toBeTruthy()
  })

  it('teks kepanjangan ditolak', async () => {
    const r = await api('post', '/admin/notifications').send({ title: 'x'.repeat(300), body: 'b' })
    expect(r.status).toBe(422)
  })

  it('reorder menolak ids bukan bilangan bulat', async () => {
    const r = await api('patch', '/admin/courses/1/lessons/reorder').send({ ids: ['1; DROP TABLE users'] })
    expect(r.status).toBe(422)
    expect((await pool.query('SELECT 1 FROM users')).rowCount).toBe(3)
  })

  it('tantangan dengan tanggal berakhir sebelum mulai ditolak', async () => {
    const r = await api('post', '/admin/challenges').send({ title: 't', startsAt: '2026-02-02', endsAt: '2026-02-01' })
    expect(r.status).toBe(422)
  })

  it('data tidak ditemukan menghasilkan 404', async () => {
    expect((await api('patch', '/admin/categories/999').send({ name: 'x' })).status).toBe(404)
    expect((await api('delete', '/admin/courses/999')).status).toBe(404)
    expect((await api('get', '/admin/students/999')).status).toBe(404)
  })
})

describe('kategori, kelas, pelajaran, tantangan', () => {
  it('alur CRUD admin', async () => {
    const cat = (await api('post', '/admin/categories').send({ name: 'Desain', slug: 'desain' })).body
    expect((await api('post', '/admin/categories').send({ name: 'Lagi', slug: 'desain' })).status).toBe(409)
    expect((await api('patch', `/admin/categories/${cat.id}`).send({ name: 'Desain Grafis' })).body.name).toBe('Desain Grafis')

    const created = await api('post', '/admin/courses').send({ categoryId: cat.id, title: 'Kelas A', varkTags: ['visual'], isPublished: true })
    expect(created.status).toBe(201)
    expect(created.body.varkTags).toEqual(['visual'])
    const courseId = created.body.id
    expect((await api('patch', `/admin/courses/${courseId}`).send({ personalityTags: ['structured'] })).body.personalityTags).toEqual(['structured'])
    expect((await api('post', '/admin/courses').send({ categoryId: cat.id, title: 'X', varkTags: ['bukan-vark'] })).status).toBe(422)

    const l1 = (await api('post', `/admin/courses/${courseId}/lessons`).send({ title: 'Satu' })).body
    const l2 = (await api('post', `/admin/courses/${courseId}/lessons`).send({ title: 'Dua', videoUrl: 'https://v/2' })).body
    expect((await api('patch', `/admin/courses/${courseId}/lessons/reorder`).send({ ids: [l2.id, l1.id] })).status).toBe(204)
    expect((await api('get', `/admin/courses/${courseId}/lessons`)).body.map((l) => l.title)).toEqual(['Dua', 'Satu'])
    expect((await api('patch', `/admin/lessons/${l1.id}`).send({ title: 'Satu B' })).body.title).toBe('Satu B')
    expect((await api('delete', `/admin/lessons/${l1.id}`)).status).toBe(204)

    const ch = await api('post', '/admin/challenges').send({ title: 'T', startsAt: '2026-01-01', endsAt: '2026-01-07', rewardPoints: 20, courseId })
    expect(ch.status).toBe(201)
    expect((await api('patch', `/admin/challenges/${ch.body.id}`).send({ rewardPoints: 30 })).body.rewardPoints).toBe(30)
    expect((await api('delete', `/admin/challenges/${ch.body.id}`)).status).toBe(204)
    expect((await api('delete', `/admin/courses/${courseId}`)).status).toBe(204)
    expect((await api('delete', `/admin/categories/${cat.id}`)).status).toBe(204)
  })
})

describe('pelajar', () => {
  it('detail memuat profil, preferensi, serta kelas dan progres', async () => {
    const cat = (await pool.query("INSERT INTO categories (name, slug) VALUES ('K','k') RETURNING id")).rows[0].id
    const course = (await pool.query("INSERT INTO courses (category_id, title, is_published) VALUES ($1,'Kelas',TRUE) RETURNING id", [cat])).rows[0].id
    const lessons = (await pool.query("INSERT INTO lessons (course_id, title, position) SELECT $1, 'L' || g, g FROM generate_series(1,2) g RETURNING id", [course])).rows
    await pool.query('INSERT INTO enrollments (user_id, course_id) VALUES ($1,$2)', [student.id, course])
    await pool.query('INSERT INTO lesson_progress (user_id, lesson_id, completed_at) VALUES ($1,$2,NOW())', [student.id, lessons[0].id])
    await pool.query("INSERT INTO learning_preferences (user_id, mbti_type, vark_style) VALUES ($1,'INTP','visual')", [student.id])

    const { status, body } = await api('get', `/admin/students/${student.id}`)
    expect(status).toBe(200)
    expect(body).toMatchObject({ name: 'Siswa', preferences: { mbtiType: 'INTP', varkStyle: 'visual' } })
    expect(body.enrollments).toEqual([expect.objectContaining({ courseId: course, title: 'Kelas', progressPercent: 50 })])
    expect((await api('get', `/admin/students/${admin.id}`)).status).toBe(404)
  })

  it('status diubah lewat /status dan /active, akun nonaktif kehilangan akses', async () => {
    const off = await api('patch', `/admin/students/${student.id}/status`).send({ isActive: false })
    expect(off.body).toEqual({ id: student.id, isActive: false })
    expect((await api('get', '/me/stats', student)).status).toBe(401)
    expect((await api('patch', `/admin/students/${student.id}/active`).send({ isActive: true })).body.isActive).toBe(true)
    expect((await api('patch', `/admin/students/${student.id}/status`).send({ isActive: 'ya' })).status).toBe(422)
    expect((await api('patch', `/admin/students/${admin.id}/status`).send({ isActive: false })).status).toBe(404)
  })
})

describe('notifikasi admin', () => {
  it('kirim ke semua pelajar lalu hapus riwayat', async () => {
    const created = await api('post', '/admin/notifications').send({ title: 'Halo', body: 'Isi' })
    expect(created.status).toBe(201)
    expect(created.body.recipients).toBe(2)
    expect((await pool.query('SELECT 1 FROM notifications')).rowCount).toBe(2)
    expect((await api('get', '/admin/notifications')).body).toHaveLength(1)
    expect((await api('delete', `/admin/notifications/${created.body.id}`)).status).toBe(204)
    expect((await pool.query('SELECT 1 FROM notifications')).rowCount).toBe(0)
    expect((await api('delete', `/admin/notifications/${created.body.id}`)).status).toBe(404)
  })

  it('kirim ke satu pelajar lewat userId', async () => {
    const r = await api('post', '/admin/notifications').send({ title: 'Halo', body: 'Isi', userId: other.id })
    expect(r.body).toMatchObject({ audience: 'Budi', recipients: 1 })
    expect((await pool.query('SELECT user_id FROM notifications')).rows).toEqual([{ user_id: other.id }])
    expect((await api('post', '/admin/notifications').send({ title: 'a', body: 'b', userId: admin.id })).status).toBe(404)
  })
})

describe('statistik dan laporan', () => {
  it('stats memuat total, aktif 7 hari, pendaftaran per minggu, dan kelas terpopuler', async () => {
    const { body } = await api('get', '/admin/stats')
    expect(body).toMatchObject({ totalStudents: 2, totalCourses: 0, activeStudents7d: 0, lessonsCompletedThisWeek: 0 })
    expect(body.weeklySignups).toHaveLength(6)
    expect(body.weeklySignups.at(-1).count).toBe(2)
    expect(body.topCourses).toEqual([])
  })

  it('reports memuat progres per kelas, rating tertinggi dan terendah, serta pesan bot', async () => {
    const cat = (await pool.query("INSERT INTO categories (name, slug) VALUES ('K','k') RETURNING id")).rows[0].id
    const [a, b] = (await pool.query("INSERT INTO courses (category_id, title, is_published) VALUES ($1,'A',TRUE), ($1,'B',TRUE) RETURNING id", [cat])).rows
    await pool.query('INSERT INTO enrollments (user_id, course_id) VALUES ($1,$2), ($1,$3)', [student.id, a.id, b.id])
    await pool.query('INSERT INTO course_ratings (user_id, course_id, rating) VALUES ($1,$2,5), ($1,$3,2)', [student.id, a.id, b.id])
    await pool.query("INSERT INTO chat_messages (user_id, content) VALUES ($1,'hai')", [student.id])

    const { body } = await api('get', '/admin/reports')
    expect(body.progressByCourse).toHaveLength(2)
    expect(body.progressByCourse[0]).toMatchObject({ title: 'A', averageProgress: 0, enrolledCount: 1 })
    expect(body.highestRated).toMatchObject({ title: 'A', rating: 5 })
    expect(body.lowestRated).toMatchObject({ title: 'B', rating: 2 })
    expect(body.chatMessageStats.totalMessages).toBe(1)
  })

  it('menghitung aktivitas hanya pada rentang tanggal', async () => {
    await pool.query("INSERT INTO chat_messages (user_id, content, created_at) VALUES ($1,'a','2026-01-10'), ($1,'b','2026-03-10')", [student.id])
    expect((await api('get', '/admin/reports')).body.period.chatMessages).toBe(2)
    expect((await api('get', '/admin/reports?from=2026-01-01&to=2026-01-31')).body.period.chatMessages).toBe(1)
    expect((await api('get', '/admin/reports?from=2026-01-10&to=2026-01-10')).body.period.chatMessages).toBe(1)
  })

  it('menolak rentang tidak valid', async () => {
    for (const q of ['from=kemarin', 'from=2026-02-01&to=2026-01-01', 'from=2026-13-45']) {
      expect((await api('get', `/admin/reports?${q}`)).status, q).toBe(422)
    }
  })
})
