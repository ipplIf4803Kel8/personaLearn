import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import 'dotenv/config'

if (!/_test$/.test(process.env.DB_NAME ?? '')) throw new Error('DB_NAME harus berakhiran _test')

const { default: pool } = await import('../src/config/db.js')
const { hashPassword } = await import('../src/utils/security.js')
const { ReminderService, localParts, shouldRemind } = await import('../src/services/ReminderService.js')

const base = { reminderEnabled: true, reminderTime: '19:00', frequency: 'daily', lastSentOn: null }
const mon = { date: '2026-11-16', time: '19:00', weekday: 1 }

describe('shouldRemind', () => {
  it('daily mengirim tiap hari', () => {
    expect(shouldRemind(base, mon, false)).toBe(true)
    expect(shouldRemind(base, { ...mon, weekday: 3 }, false)).toBe(true)
  })
  it('weekly hanya Senin', () => {
    const w = { ...base, frequency: 'weekly' }
    expect(shouldRemind(w, mon, false)).toBe(true)
    expect(shouldRemind(w, { ...mon, weekday: 2 }, false)).toBe(false)
  })
  it('tidak dobel pada hari yang sama', () => {
    expect(shouldRemind({ ...base, lastSentOn: '2026-11-16' }, mon, false)).toBe(false)
    expect(shouldRemind({ ...base, lastSentOn: '2026-11-15' }, mon, false)).toBe(true)
  })
  it('tidak mengirim bila sudah belajar, jam beda, atau dimatikan', () => {
    expect(shouldRemind(base, mon, true)).toBe(false)
    expect(shouldRemind(base, { ...mon, time: '19:01' }, false)).toBe(false)
    expect(shouldRemind({ ...base, reminderEnabled: false }, mon, false)).toBe(false)
  })
  it('jam lokal mengikuti zona waktu', () => {
    const now = new Date('2026-11-16T12:00:00Z')
    expect(localParts(now, 'Asia/Jakarta')).toEqual({ date: '2026-11-16', time: '19:00', weekday: 1 })
    expect(localParts(new Date('2026-11-16T18:30:00Z'), 'Asia/Jakarta')).toEqual({ date: '2026-11-17', time: '01:30', weekday: 2 })
    expect(localParts(now, 'UTC').time).toBe('12:00')
  })
})

describe('ReminderService.tick', () => {
  const tag = `rmd${Date.now()}`
  let userId
  beforeAll(async () => {
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ('Rem', $1, $2, 'student') RETURNING id",
      [`rem.${tag}@test.id`, await hashPassword('rahasia123')]
    )
    userId = rows[0].id
    await pool.query(
      "INSERT INTO notification_settings (user_id, reminder_enabled, reminder_time, frequency) VALUES ($1, TRUE, '19:00', 'daily')",
      [userId]
    )
  })
  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE id = $1', [userId])
    await pool.end()
  })

  it('membuat notifikasi sekali dan tidak dobel', async () => {
    const svc = new ReminderService('Asia/Jakarta')
    const now = new Date('2026-11-16T12:00:00Z') // 19:00 WIB
    const count = () => pool.query("SELECT COUNT(*)::int AS n FROM notifications WHERE user_id = $1 AND type = 'reminder'", [userId]).then((r) => r.rows[0].n)
    expect(await svc.tick(new Date('2026-11-16T12:01:00Z'))).toBe(0)
    expect(await count()).toBe(0)
    await svc.tick(now)
    await svc.tick(now)
    expect(await count()).toBe(1)
  })
})
