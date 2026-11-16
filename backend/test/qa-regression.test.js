// Regresi hasil QA penuh (14 temuan). Jalankan terhadap DB uji (DB_NAME berakhiran _test).
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

process.env.CORS_ORIGIN = 'http://a.test, http://b.test'
const sent = vi.hoisted(() => ({ otp: null, fail: false }))
vi.mock('../src/utils/mailer.js', () => ({
  sendOtpEmail: async (to, otp) => {
    if (sent.fail) throw new Error('smtp mati')
    sent.otp = otp
  },
}))

const { default: app } = await import('../src/app.js')
const { default: pool } = await import('../src/config/db.js')
const { hashPassword, signToken } = await import('../src/utils/security.js')
const { default: PasswordReset } = await import('../src/models/PasswordReset.js')
const { errorHandler } = await import('../src/middlewares/errorHandler.js')

if (!/_test$/.test(process.env.DB_NAME ?? '')) throw new Error('DB_NAME harus berakhiran _test')

let admin, student, seq = 0
const bearer = (u) => ({ Authorization: `Bearer ${typeof u === 'string' ? u : signToken(u)}` })
const call = (method, path, u, body) => {
  const r = request(app)[method](`/api${path}`).set(bearer(u))
  return body === undefined ? r : r.send(body)
}
const login = (email, password) => request(app).post('/api/auth/login').send({ email, password })
const addUser = async (email, role = 'student', password = 'rahasia123') =>
  (await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *', ['U', email, hashPassword(password), role])).rows[0]
const fresh = () => `u${Date.now()}${++seq}@qa.test`

async function makeCourse({ lessons = 1, duration = 100, published = true } = {}) {
  const cat = (await pool.query("INSERT INTO categories (name, slug) VALUES ('K', $1) RETURNING id", [`k${++seq}`])).rows[0].id
  const id = (await pool.query('INSERT INTO courses (category_id, title, is_published) VALUES ($1, $2, $3) RETURNING id', [cat, `Kelas ${seq}`, published])).rows[0].id
  const lessonIds = []
  for (let p = 1; p <= lessons; p++) {
    lessonIds.push((await pool.query('INSERT INTO lessons (course_id, title, position, duration_seconds) VALUES ($1, $2, $3, $4) RETURNING id', [id, `L${p}`, p, duration])).rows[0].id)
  }
  return { id, cat, lessonIds }
}

beforeEach(async () => {
  sent.otp = null
  sent.fail = false
  await pool.query('TRUNCATE users, categories RESTART IDENTITY CASCADE')
  admin = await addUser('admin@qa.test', 'admin')
  student = await addUser('siswa@qa.test')
})
afterAll(async () => {
  await pool.query('TRUNCATE users, categories RESTART IDENTITY CASCADE')
  await pool.end()
})

describe('1 pembatas login', () => {
  it('spasi dan huruf besar pada email tidak melewati batas; 429 setelah 10 gagal', async () => {
    const email = fresh()
    const variants = [email, ` ${email}`, email.toUpperCase(), `  ${email} `]
    for (let i = 0; i < 10; i++) expect((await login(variants[i % 4], 'salahsalah1')).status).toBe(401)
    expect((await login(` ${email}`, 'salahsalah1')).status).toBe(429)
    expect((await login(email, 'salahsalah1')).status).toBe(429)
  })

  it('login sukses mereset hitungan, admin tidak terkunci', async () => {
    for (let i = 0; i < 15; i++) expect((await login('admin@qa.test', 'rahasia123')).status).toBe(200)
    const email = fresh()
    await addUser(email)
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < 9; i++) expect((await login(email, 'salahsalah1')).status).toBe(401)
      expect((await login(email, 'rahasia123')).status).toBe(200)
    }
  })

  it('forgot-password punya hitungan sendiri dan juga menormalkan email', async () => {
    const email = fresh()
    for (let i = 0; i < 5; i++) {
      expect((await request(app).post('/api/auth/forgot-password').send({ email: i % 2 ? ` ${email}` : email })).status).toBe(200)
    }
    expect((await request(app).post('/api/auth/forgot-password').send({ email: ` ${email.toUpperCase()}` })).status).toBe(429)
    expect((await login(email, 'salahsalah1')).status).toBe(401)
  })
})

describe('2 byte NUL', () => {
  const nul = 'a\u0000b'
  it('ditolak 422 di register, login, search, chat, rating, profil', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: nul, email: fresh(), password: 'rahasia123', confirmPassword: 'rahasia123' })
    expect(reg.status).toBe(422)
    expect(reg.body.message).toBe('Teks mengandung karakter tidak valid')
    expect((await login(`${nul}@qa.test`, 'rahasia123')).status).toBe(422)
    expect((await login(fresh(), nul)).status).toBe(422)
    expect((await call('get', '/courses?search=a%00b', student)).status).toBe(422)
    expect((await call('post', '/chat/messages', student, { content: nul })).status).toBe(422)
    expect((await call('post', '/courses/1/rating', student, { rating: 5, review: nul })).status).toBe(422)
    expect((await call('put', '/me/profile', student, { name: nul, email: 'x@qa.test' })).status).toBe(422)
  })

  it('kode pg 22021 dipetakan ke 422 berpesan Indonesia', () => {
    let out
    const res = { status: (s) => ({ json: (b) => (out = { s, b }) }) }
    errorHandler({ code: '22021', message: 'invalid byte sequence' }, {}, res)
    expect(out).toEqual({ s: 422, b: { message: 'Teks mengandung karakter tidak valid' } })
  })
})

describe('3 panjang kata sandi baru', () => {
  it('newPassword maksimal 72 karakter', async () => {
    const long = `a1${'x'.repeat(71)}`
    const res = await call('put', '/me/password', student, { oldPassword: 'rahasia123', newPassword: long })
    expect(res.status).toBe(422)
    expect(res.body.errors.newPassword).toMatch(/72/)
    const ok = await call('put', '/me/password', student, { oldPassword: 'rahasia123', newPassword: `a1${'x'.repeat(70)}` })
    expect(ok.status).toBe(200)
  })
})

describe('4 batas OTP atomik', () => {
  it('request paralel tidak melewati 5 percobaan', async () => {
    await PasswordReset.issue(student.id, hashPassword('123456'))
    const reset = await PasswordReset.findActive(student.id)
    const results = await Promise.all(Array.from({ length: 25 }, () => reset.countAttempt()))
    expect(results.filter(Boolean)).toHaveLength(5)
    const { rows } = await pool.query('SELECT attempts FROM password_resets WHERE id = $1', [reset.id])
    expect(rows[0].attempts).toBe(5)
  })

  it('OTP benar ditolak setelah 5 tebakan salah paralel', async () => {
    await request(app).post('/api/auth/forgot-password').send({ email: student.email })
    const otp = sent.otp
    const wrong = otp === '000000' ? '111111' : '000000'
    await Promise.all(Array.from({ length: 6 }, () => request(app).post('/api/auth/reset-password').send({ email: student.email, otp: wrong, password: 'baru12345' })))
    const res = await request(app).post('/api/auth/reset-password').send({ email: student.email, otp, password: 'baru12345' })
    expect(res.status).toBe(400)
  })
})

describe('5 skema URL admin', () => {
  let course
  beforeEach(async () => {
    course = await makeCourse()
  })
  const body = (extra) => ({ categoryId: course.cat, title: 'T', ...extra })

  it('thumbnailUrl hanya http/https atau kosong', async () => {
    for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'ftp://x.test/a.png', 'bukan url']) {
      expect((await call('post', '/admin/courses', admin, body({ thumbnailUrl: bad }))).status, bad).toBe(422)
      expect((await call('patch', `/admin/courses/${course.id}`, admin, { thumbnailUrl: bad })).status, bad).toBe(422)
    }
    for (const ok of ['https://x.test/a.png', '']) {
      const res = await call('post', '/admin/courses', admin, body({ thumbnailUrl: ok }))
      expect(res.status, `${ok} ${res.body.message}`).toBe(201)
    }
  })

  it('videoUrl hanya http/https atau embed YouTube', async () => {
    for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'ftp://x.test/v.mp4', '<iframe src="https://evil.test/x"></iframe>']) {
      expect((await call('post', `/admin/courses/${course.id}/lessons`, admin, { title: 'L', videoUrl: bad })).status, bad).toBe(422)
      expect((await call('patch', `/admin/lessons/${course.lessonIds[0]}`, admin, { videoUrl: bad })).status, bad).toBe(422)
    }
    const embed = '<iframe width="560" src="https://www.youtube.com/embed/abcdefghijk" title="v"></iframe>'
    for (const ok of ['https://youtu.be/abcdefghijk', 'http://x.test/v.mp4', '', embed]) {
      expect((await call('post', `/admin/courses/${course.id}/lessons`, admin, { title: 'L', videoUrl: ok })).status, ok).toBe(201)
    }
  })
})

describe('6 posisi video', () => {
  it('menolak posisi melebihi durasi + 60 (durasi 0: maks 86400)', async () => {
    const c = await makeCourse({ lessons: 1, duration: 100 })
    const z = await makeCourse({ lessons: 1, duration: 0 })
    await call('post', `/courses/${c.id}/enroll`, student)
    await call('post', `/courses/${z.id}/enroll`, student)
    const pos = (id, s) => call('put', `/lessons/${id}/position`, student, { positionSeconds: s })
    expect((await pos(c.lessonIds[0], 160)).status).toBe(200)
    expect((await pos(c.lessonIds[0], 161)).status).toBe(422)
    expect((await pos(z.lessonIds[0], 86400)).status).toBe(200)
    expect((await pos(z.lessonIds[0], 86401)).status).toBe(422)
    expect((await call('post', `/lessons/${c.lessonIds[0]}/complete`, student, { positionSeconds: 99999 })).status).toBe(422)
    expect((await call('post', `/lessons/${c.lessonIds[0]}/complete`, student, { positionSeconds: 100 })).status).toBe(200)
  })
})

describe('7 enumerasi email', () => {
  it('respons login dan forgot-password identik untuk email terdaftar dan tidak', async () => {
    const a = await login('tidak-ada@qa.test', 'rahasia123')
    const b = await login(student.email, 'salahsalah1')
    expect([a.status, a.body]).toEqual([b.status, b.body])
    const f1 = await request(app).post('/api/auth/forgot-password').send({ email: student.email })
    const f2 = await request(app).post('/api/auth/forgot-password').send({ email: 'tidak-ada@qa.test' })
    expect([f1.status, f1.body]).toEqual([f2.status, f2.body])
  })

  it('kegagalan kirim email tidak memengaruhi respons dan tidak melempar', async () => {
    sent.fail = true
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await request(app).post('/api/auth/forgot-password').send({ email: student.email })
    expect(res.status).toBe(200)
    await vi.waitFor(() => expect(spy).toHaveBeenCalled())
    spy.mockRestore()
  })
})

describe('8 pencabutan token setelah ganti sandi', () => {
  const old = (u) => jwt.sign({ sub: u.id, role: u.role, iat: Math.floor(Date.now() / 1000) - 30 }, process.env.JWT_SECRET)

  it('PUT /me/password mencabut token lama dan mengirim token baru yang valid', async () => {
    const lama = old(student)
    expect((await call('get', '/me/profile', lama)).status).toBe(200)
    const res = await call('put', '/me/password', lama, { oldPassword: 'rahasia123', newPassword: 'baru12345' })
    expect(res.status).toBe(200)
    expect((await call('get', '/me/profile', lama)).status).toBe(401)
    expect((await call('get', '/me/profile', res.body.data.token)).status).toBe(200)
  })

  it('reset-password mencabut token lama; login baru tetap valid', async () => {
    const lama = old(student)
    await request(app).post('/api/auth/forgot-password').send({ email: student.email })
    const r = await request(app).post('/api/auth/reset-password').send({ email: student.email, otp: sent.otp, password: 'baru12345' })
    expect(r.status).toBe(200)
    expect((await call('get', '/me/profile', lama)).status).toBe(401)
    const l = await login(student.email, 'baru12345')
    expect((await call('get', '/me/profile', l.body.token)).status).toBe(200)
  })

  it('login berulang tidak mencabut token lain', async () => {
    const lama = old(student)
    await login(student.email, 'rahasia123')
    expect((await call('get', '/me/profile', lama)).status).toBe(200)
  })
})

describe('9 header dan CORS', () => {
  it('tanpa X-Powered-By, dengan nosniff, CORS dibatasi ke daftar origin', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://b.test')
    expect(res.headers['x-powered-by']).toBeUndefined()
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['access-control-allow-origin']).toBe('http://b.test')
    const other = await request(app).get('/api/health').set('Origin', 'http://evil.test')
    expect(other.headers['access-control-allow-origin']).toBeUndefined()
  })
})

describe('10 kelas tanpa pelajaran', () => {
  it('tidak tampil untuk pelajar dan tidak bisa diambil; admin tetap melihatnya', async () => {
    const empty = await makeCourse({ lessons: 0 })
    const full = await makeCourse({ lessons: 1 })
    for (const path of ['/courses', '/courses/popular', '/courses/recommended']) {
      const ids = (await call('get', path, student)).body.data.map((c) => c.id)
      expect(ids, path).toContain(full.id)
      expect(ids, path).not.toContain(empty.id)
    }
    const enroll = await call('post', `/courses/${empty.id}/enroll`, student)
    expect(enroll.status).toBe(422)
    expect(enroll.body.message).toBe('Kelas belum memiliki pelajaran')
    const adminIds = (await call('get', '/admin/courses', admin)).body.map((c) => c.id)
    expect(adminIds).toEqual(expect.arrayContaining([empty.id, full.id]))
  })
})

describe('11 posisi pelajaran', () => {
  it('UNIQUE (course_id, position) mencegah duplikat', async () => {
    const c = await makeCourse({ lessons: 2 })
    await expect(pool.query('UPDATE lessons SET position = 1 WHERE id = $1', [c.lessonIds[1]])).rejects.toMatchObject({ code: '23505' })
  })

  it('reorder selalu menghasilkan 1..n berurutan (sebagian boleh, id ganda ditolak)', async () => {
    const c = await makeCourse({ lessons: 4 })
    const [a, b, d, e] = c.lessonIds
    const positions = async () => (await pool.query('SELECT id, position FROM lessons WHERE course_id = $1 ORDER BY position', [c.id])).rows
    expect((await call('patch', `/admin/courses/${c.id}/lessons/reorder`, admin, { ids: [e, d, b, a] })).status).toBe(204)
    expect(await positions()).toEqual([{ id: e, position: 1 }, { id: d, position: 2 }, { id: b, position: 3 }, { id: a, position: 4 }])
    expect((await call('patch', `/admin/courses/${c.id}/lessons/reorder`, admin, { ids: [a, a, b] })).status).toBe(422)
    expect((await call('patch', `/admin/courses/${c.id}/lessons/reorder`, admin, { ids: [a, b] })).status).toBe(204)
    expect(await positions()).toEqual([{ id: a, position: 1 }, { id: b, position: 2 }, { id: e, position: 3 }, { id: d, position: 4 }])
  })

  it('pelajaran baru memakai posisi berikutnya', async () => {
    const c = await makeCourse({ lessons: 2 })
    const res = await call('post', `/admin/courses/${c.id}/lessons`, admin, { title: 'Baru' })
    expect(res.body.position).toBe(3)
  })
})

describe('12 preferensi VARK', () => {
  it('menyimpan keempat gaya belajar dan MBTI null', async () => {
    for (const style of ['visual', 'auditory', 'reading', 'kinesthetic']) {
      const res = await call('put', '/me/preferences', student, { varkStyle: style, mbtiType: null })
      expect(res.status, style).toBe(200)
      const got = await call('get', '/me/preferences', student)
      expect(got.body.data).toEqual({ varkStyle: style, mbtiType: null })
    }
  })
})

describe('13 dan 14 kategori', () => {
  it('hapus kategori yang dipakai kelas memberi 409 berpesan jelas', async () => {
    const c = await makeCourse()
    const res = await call('delete', `/admin/categories/${c.cat}`, admin)
    expect(res.status).toBe(409)
    expect(res.body.message).toBe('Kategori masih dipakai oleh kelas, pindahkan atau hapus kelasnya dulu')
  })

  it('slug ganda memberi 409 Slug sudah dipakai (tambah dan ubah)', async () => {
    await call('post', '/admin/categories', admin, { name: 'A', slug: 'sama' })
    const dup = await call('post', '/admin/categories', admin, { name: 'B', slug: 'sama' })
    expect(dup.status).toBe(409)
    expect(dup.body.message).toBe('Slug sudah dipakai')
    const other = await call('post', '/admin/categories', admin, { name: 'C', slug: 'lain' })
    const upd = await call('patch', `/admin/categories/${other.body.id}`, admin, { slug: 'sama' })
    expect(upd.status).toBe(409)
    expect(upd.body.message).toBe('Slug sudah dipakai')
  })
})
