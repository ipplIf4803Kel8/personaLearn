import pool from '../config/db.js'
import { UserStreak } from '../models/UserStreak.js'

const DAY_MS = 86400000
const toDay = (s) => Date.parse(`${s}T00:00:00Z`)

// Streak naik 1 jika aktivitas di hari berikutnya, tetap di hari yang sama, reset ke 1 jika terlewat.
// Semua tanggal berupa string 'YYYY-MM-DD' agar mudah diuji.
export class StreakService {
  #db

  constructor(db = pool) {
    this.#db = db
  }

  static today(now = new Date()) {
    return now.toLocaleDateString('en-CA')
  }

  static dayDiff(from, to) {
    return Math.round((toDay(to) - toDay(from)) / DAY_MS)
  }

  // state: { currentStreak, longestStreak, lastActivityDate }
  static next(state, today) {
    const { currentStreak = 0, longestStreak = 0, lastActivityDate = null } = state
    const gap = lastActivityDate ? StreakService.dayDiff(lastActivityDate, today) : null
    let current
    if (gap === null || gap > 1) current = 1
    else if (gap === 1) current = currentStreak + 1
    else current = Math.max(currentStreak, 1)
    const last = gap !== null && gap < 0 ? lastActivityDate : today
    return { currentStreak: current, longestStreak: Math.max(longestStreak, current), lastActivityDate: last }
  }

  // Streak yang ditampilkan: sudah putus (terlewat lebih dari sehari) dihitung 0.
  static effective(state, today) {
    if (!state.lastActivityDate) return 0
    return StreakService.dayDiff(state.lastActivityDate, today) > 1 ? 0 : state.currentStreak
  }

  async record(userId, today = StreakService.today()) {
    const saved = await UserStreak.findByUserId(userId, this.#db)
    const state = StreakService.next(
      { currentStreak: saved.currentStreak, longestStreak: saved.longestStreak, lastActivityDate: saved.lastActivityDate },
      today
    )
    await UserStreak.save({ userId, ...state }, this.#db)
    return state
  }

  async current(userId, today = StreakService.today()) {
    const saved = await UserStreak.findByUserId(userId, this.#db)
    return {
      currentStreak: StreakService.effective(saved, today),
      longestStreak: saved.longestStreak,
    }
  }
}
