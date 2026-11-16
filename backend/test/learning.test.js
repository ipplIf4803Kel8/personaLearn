// Uji belajar dan gamifikasi. Bagian unit tidak butuh database; bagian integrasi hanya jalan bila
// DB_NAME berakhiran _test, mis. npm test
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import 'dotenv/config'
import pool from '../src/config/db.js'
import { ProgressService } from '../src/services/ProgressService.js'
import { LESSON_POINTS, PointService } from '../src/services/PointService.js'
import { StreakService } from '../src/services/StreakService.js'

describe('StreakService', () => {
  const next = (lastActivityDate, currentStreak, today, longestStreak = currentStreak) =>
    StreakService.next({ currentStreak, longestStreak, lastActivityDate }, today)

  it('mulai dari 1 pada aktivitas pertama', () => {
    expect(next(null, 0, '2026-03-10')).toEqual({ currentStreak: 1, longestStreak: 1, lastActivityDate: '2026-03-10' })
  })
  it('tetap di hari yang sama', () => {
    expect(next('2026-03-10', 3, '2026-03-10').currentStreak).toBe(3)
  })
  it('naik 1 di hari berikutnya, termasuk lintas bulan dan tahun', () => {
    expect(next('2026-03-10', 3, '2026-03-11').currentStreak).toBe(4)
    expect(next('2025-12-31', 5, '2026-01-01').currentStreak).toBe(6)
    expect(next('2026-02-28', 1, '2026-03-01').currentStreak).toBe(2)
  })
  it('reset ke 1 jika terlewat lebih dari sehari, rekor terpanjang tetap', () => {
    const r = next('2026-03-10', 7, '2026-03-12')
    expect(r.currentStreak).toBe(1)
    expect(r.longestStreak).toBe(7)
  })
  it('rekor terpanjang ikut naik', () => {
    expect(next('2026-03-10', 4, '2026-03-11', 4).longestStreak).toBe(5)
  })
  it('streak yang ditampilkan 0 jika sudah putus', () => {
    const state = { currentStreak: 5, lastActivityDate: '2026-03-10' }
    expect(StreakService.effective(state, '2026-03-11')).toBe(5)
    expect(StreakService.effective(state, '2026-03-12')).toBe(0)
    expect(StreakService.effective({ currentStreak: 0, lastActivityDate: null }, '2026-03-12')).toBe(0)
  })
  it('today memakai tanggal lokal format YYYY-MM-DD', () => {
    expect(StreakService.today(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
})

describe('PointService', () => {
  it('pelajaran bernilai 10 poin, tantangan mengikuti reward', () => {
    expect(PointService.pointsFor('lesson')).toBe(LESSON_POINTS)
    expect(PointService.pointsFor('challenge', 50)).toBe(50)
    expect(PointService.pointsFor('challenge', -5)).toBe(0)
    expect(() => PointService.pointsFor('lainnya')).toThrow()
  })
  it('award menyimpan transaksi dan melewati poin 0', async () => {
    const calls = []
    const db = { query: async (sql, params) => (calls.push(params), { rows: [{ id: 1, user_id: 7, points: params[1], source: params[2], reference_id: params[3] }] }) }
    const service = new PointService(db)
    expect(await service.award(7, 'lesson', 3)).toBe(10)
    expect(calls[0]).toEqual([7, 10, 'lesson', 3])
    expect(await service.award(7, 'challenge', 4, 0)).toBe(0)
    expect(calls).toHaveLength(1)
  })
})

describe('ProgressService', () => {
  it('persentase dibulatkan dan aman untuk kelas kosong', () => {
    expect(ProgressService.percent(1, 3)).toBe(33)
    expect(ProgressService.percent(2, 3)).toBe(67)
    expect(ProgressService.percent(4, 4)).toBe(100)
    expect(ProgressService.percent(0, 0)).toBe(0)
  })
  it('pelajaran berikutnya adalah yang pertama belum selesai', () => {
    const lessons = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(ProgressService.nextLessonId(lessons, [1])).toBe(2)
    expect(ProgressService.nextLessonId(lessons, [2, 1])).toBe(3)
    expect(ProgressService.nextLessonId(lessons, [1, 2, 3])).toBeNull()
  })
})

const canUseDb = /_test$/.test(process.env.DB_NAME ?? '')

describe.skipIf(!canUseDb)('API belajar', () => {
  let app, token, otherToken, userId, courseId, lessonIds, challengeId
  const auth = (t = token) => ({ Authorization: `Bearer ${t}` })
  const tag = `learn${Date.now()}`

  beforeAll(async () => {
    app = (await import('../src/app.js')).default
    const user = async (n) =>
      (await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, 'x', 'student') RETURNING id", [`Uji ${n}`, `${tag}${n}@test.id`])).rows[0].id
    userId = await user(1)
    const otherId = await user(2)
    const sign = (id) => jwt.sign({ sub: id, role: 'student' }, process.env.JWT_SECRET)
    token = sign(userId)
    otherToken = sign(otherId)
    const cat = (await pool.query('INSERT INTO categories (name, slug) VALUES ($1, $1) RETURNING id', [tag])).rows[0].id
    courseId = (await pool.query('INSERT INTO courses (category_id, title, is_published) VALUES ($1, $2, TRUE) RETURNING id', [cat, tag])).rows[0].id
    lessonIds = []
    for (const position of [1, 2]) {
      lessonIds.push((await pool.query('INSERT INTO lessons (course_id, title, position, duration_seconds) VALUES ($1, $2, $3, 60) RETURNING id', [courseId, `P${position}`, position])).rows[0].id)
    }
    await pool.query('INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)', [userId, courseId])
    challengeId = (
      await pool.query("INSERT INTO challenges (title, reward_points, starts_at, ends_at) VALUES ($1, 25, CURRENT_DATE - 1, CURRENT_DATE + 1) RETURNING id", [tag])
    ).rows[0].id
  })

  afterAll(async () => {
    await pool.query('DELETE FROM challenges WHERE title = $1', [tag])
    await pool.query('DELETE FROM users WHERE email LIKE $1', [`${tag}%`])
    await pool.query('DELETE FROM courses WHERE title = $1', [tag])
    await pool.query('DELETE FROM categories WHERE name = $1', [tag])
    await pool.end()
  })

  it('menolak tanpa token dan pelajaran dari kelas yang belum diambil', async () => {
    expect((await request(app).get('/api/me/stats')).status).toBe(401)
    const res = await request(app).get(`/api/lessons/${lessonIds[0]}`).set(auth(otherToken))
    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/Ambil kelas/)
  })

  it('validasi menolak id dan body yang tidak sah', async () => {
    expect((await request(app).get('/api/lessons/abc').set(auth())).status).toBe(422)
    const res = await request(app).post(`/api/lessons/${lessonIds[0]}/complete`).set(auth()).send({ points: 999 })
    expect(res.status).toBe(422)
  })

  it('menyelesaikan pelajaran: +10 poin sekali saja, streak 1, progres 50 persen', async () => {
    const first = await request(app).post(`/api/lessons/${lessonIds[0]}/complete`).set(auth()).send({ positionSeconds: 55 })
    expect(first.status).toBe(200)
    expect(first.body.data).toMatchObject({ alreadyCompleted: false, pointsEarned: 10, totalPoints: 10, streak: 1, courseCompleted: false, nextLessonId: lessonIds[1] })
    expect(first.body.data.progress).toEqual({ completedLessons: 1, totalLessons: 2, progressPercent: 50 })

    const again = await request(app).post(`/api/lessons/${lessonIds[0]}/complete`).set(auth()).send({})
    expect(again.body.data).toMatchObject({ alreadyCompleted: true, pointsEarned: 0, totalPoints: 10, streak: 1 })
    const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM point_transactions WHERE user_id = $1 AND source = 'lesson'", [userId])
    expect(rows[0].n).toBe(1)

    const detail = await request(app).get(`/api/lessons/${lessonIds[0]}`).set(auth())
    expect(detail.body.data).toMatchObject({ completed: true, lastPositionSeconds: 55, number: 1, totalLessons: 2 })
  })

  it('reaksi: like lalu ganti dislike memperbarui jumlah', async () => {
    const put = (reaction) => request(app).put(`/api/lessons/${lessonIds[0]}/reaction`).set(auth()).send({ reaction })
    expect((await put('like')).body.data).toEqual({ likes: 1, dislikes: 0, myReaction: 'like' })
    expect((await put('dislike')).body.data).toEqual({ likes: 0, dislikes: 1, myReaction: 'dislike' })
    expect((await put('mungkin')).status).toBe(422)
  })

  it('pelajaran terakhir mengisi completed_at kelas dan mengirim notifikasi', async () => {
    const res = await request(app).post(`/api/lessons/${lessonIds[1]}/complete`).set(auth()).send({})
    expect(res.body.data).toMatchObject({ courseCompleted: true, totalPoints: 20, nextLessonId: null })
    const { rows } = await pool.query('SELECT completed_at FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, courseId])
    expect(rows[0].completed_at).not.toBeNull()
    expect((await pool.query('SELECT 1 FROM notifications WHERE user_id = $1', [userId])).rowCount).toBe(1)
  })

  it('daftar kelas, progres kelas, dan statistik', async () => {
    const list = await request(app).get('/api/me/enrollments').set(auth())
    expect(list.body.data[0]).toMatchObject({ courseId, progressPercent: 100, totalLessons: 2, completedLessons: 2 })
    const one = await request(app).get(`/api/me/enrollments/${courseId}`).set(auth())
    expect(one.body.data.lessons.map((l) => l.completed)).toEqual([true, true])
    expect((await request(app).get(`/api/me/enrollments/${courseId}`).set(auth(otherToken))).status).toBe(404)
    const stats = await request(app).get('/api/me/stats').set(auth())
    expect(stats.body.data).toMatchObject({ totalPoints: 20, currentStreak: 1, activeCourses: 0 })
  })

  it('tantangan: tampil aktif, selesai sekali, poin sesuai reward', async () => {
    const active = await request(app).get('/api/challenges/active').set(auth())
    expect(active.body.data.find((c) => c.id === challengeId)).toMatchObject({ completed: false, rewardPoints: 25 })
    const done = await request(app).post(`/api/challenges/${challengeId}/complete`).set(auth())
    expect(done.body.data).toMatchObject({ pointsEarned: 25, totalPoints: 45 })
    expect((await request(app).post(`/api/challenges/${challengeId}/complete`).set(auth())).status).toBe(409)
    const after = await request(app).get('/api/challenges/active').set(auth())
    expect(after.body.data.find((c) => c.id === challengeId).completed).toBe(true)
  })

  it('tantangan di luar periode ditolak', async () => {
    const old = (await pool.query("INSERT INTO challenges (title, reward_points, starts_at, ends_at) VALUES ($1, 5, '2020-01-01', '2020-01-07') RETURNING id", [tag])).rows[0].id
    const res = await request(app).post(`/api/challenges/${old}/complete`).set(auth())
    expect(res.status).toBe(400)
    expect((await request(app).post('/api/challenges/999999/complete').set(auth())).status).toBe(404)
  })
})
