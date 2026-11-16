import { describe, expect, it } from 'vitest'
import {
  validateCategory,
  validateChallenge,
  validateCourse,
  validateLesson,
  validateNotification,
} from './adminValidation'

describe('validateCategory', () => {
  it('menerima nama dan slug valid atau slug kosong', () => {
    expect(validateCategory({ name: 'Web', slug: 'web-dev' })).toEqual({})
    expect(validateCategory({ name: 'Web', slug: '' })).toEqual({})
  })
  it('menolak nama kosong, terlalu panjang, dan slug tidak valid', () => {
    expect(validateCategory({ name: ' ', slug: '' }).name).toMatch(/wajib/)
    expect(validateCategory({ name: 'a'.repeat(101), slug: '' }).name).toMatch(/100/)
    expect(validateCategory({ name: 'x', slug: 'Web Dev' }).slug).toBeTruthy()
    expect(validateCategory({ name: 'x', slug: '-a' }).slug).toBeTruthy()
  })
})

describe('validateCourse', () => {
  const ok = { title: 'Kelas', categoryId: 1, level: 'Beginner', coverUrl: '' }
  it('menerima data valid', () => {
    expect(validateCourse(ok)).toEqual({})
    expect(validateCourse({ ...ok, coverUrl: 'https://x.id/a.png' })).toEqual({})
  })
  it('menolak data tidak valid', () => {
    expect(validateCourse({ ...ok, title: '' }).title).toBeTruthy()
    expect(validateCourse({ ...ok, title: 'a'.repeat(201) }).title).toMatch(/200/)
    expect(validateCourse({ ...ok, categoryId: null }).categoryId).toBeTruthy()
    expect(validateCourse({ ...ok, level: 'Expert' }).level).toBeTruthy()
    expect(validateCourse({ ...ok, coverUrl: 'ftp://x' }).coverUrl).toBeTruthy()
  })
})

describe('validateLesson', () => {
  it('menerima URL http, embed YouTube, dan durasi kosong', () => {
    expect(validateLesson({ title: 'a', videoUrl: 'https://youtu.be/x', durationMinutes: '5' })).toEqual({})
    expect(
      validateLesson({ title: 'a', videoUrl: '<iframe src="https://www.youtube.com/embed/abc"></iframe>', durationMinutes: '' })
    ).toEqual({})
    expect(validateLesson({ title: 'a', videoUrl: '', durationMinutes: '0' })).toEqual({})
  })
  it('menolak judul kosong, URL salah, durasi negatif atau bukan angka', () => {
    expect(validateLesson({ title: '', videoUrl: '', durationMinutes: '' }).title).toBeTruthy()
    expect(validateLesson({ title: 'a', videoUrl: 'javascript:1', durationMinutes: '' }).videoUrl).toBeTruthy()
    expect(validateLesson({ title: 'a', videoUrl: '', durationMinutes: '-1' }).durationMinutes).toBeTruthy()
    expect(validateLesson({ title: 'a', videoUrl: '', durationMinutes: 'abc' }).durationMinutes).toBeTruthy()
  })
})

describe('validateChallenge', () => {
  const ok = { title: 'T', rewardPoints: '10', startsAt: '2026-01-02', endsAt: '2026-01-02' }
  it('menerima data valid', () => expect(validateChallenge(ok)).toEqual({}))
  it('menolak poin tidak bulat atau negatif', () => {
    expect(validateChallenge({ ...ok, rewardPoints: '1.5' }).rewardPoints).toBeTruthy()
    expect(validateChallenge({ ...ok, rewardPoints: '-1' }).rewardPoints).toBeTruthy()
    expect(validateChallenge({ ...ok, rewardPoints: '' }).rewardPoints).toBeTruthy()
  })
  it('menolak tanggal selesai sebelum mulai dan judul kosong', () => {
    expect(validateChallenge({ ...ok, endsAt: '2026-01-01' }).endsAt).toBeTruthy()
    expect(validateChallenge({ ...ok, title: ' ' }).title).toBeTruthy()
  })
})

describe('validateNotification', () => {
  it('mewajibkan judul dan isi', () => {
    expect(validateNotification({ title: 'a', body: 'b' })).toEqual({})
    expect(Object.keys(validateNotification({ title: '', body: ' ' }))).toEqual(['title', 'body'])
  })
})

// Kunci error harus sama dengan yang dibaca form (errors.<kunci> di halaman admin)
describe('kunci error sesuai form', () => {
  it('Kelas: URL sampul salah memakai kunci coverUrl (form memetakan ke thumbnailUrl)', () => {
    const errors = validateCourse({ title: 'a', categoryId: 1, level: 'Beginner', coverUrl: 'ftp://x' })
    expect(Object.keys(errors)).toEqual(['coverUrl'])
  })
  it('semua validator hanya memakai kunci yang dibaca form', () => {
    expect(Object.keys(validateCategory({ name: '', slug: 'A B' })).sort()).toEqual(['name', 'slug'])
    expect(Object.keys(validateCourse({ title: '', categoryId: null, level: 'x', coverUrl: 'x' })).sort()).toEqual(['categoryId', 'coverUrl', 'level', 'title'])
    expect(Object.keys(validateLesson({ title: '', videoUrl: 'x', durationMinutes: '-1' })).sort()).toEqual(['durationMinutes', 'title', 'videoUrl'])
    expect(Object.keys(validateChallenge({ title: '', rewardPoints: '', startsAt: '2026-02-01', endsAt: '2026-01-01' })).sort()).toEqual(['endsAt', 'rewardPoints', 'title'])
    expect(Object.keys(validateNotification({ title: '', body: '' })).sort()).toEqual(['body', 'title'])
  })
})
