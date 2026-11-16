import pool from '../config/db.js'

// Streak belajar per pengguna. lastActivityDate berupa string 'YYYY-MM-DD'.
export class UserStreak {
  #userId
  #currentStreak
  #longestStreak
  #lastActivityDate

  constructor({ userId, currentStreak = 0, longestStreak = 0, lastActivityDate = null }) {
    this.#userId = userId
    this.#currentStreak = currentStreak
    this.#longestStreak = longestStreak
    this.#lastActivityDate = lastActivityDate
  }

  get userId() {
    return this.#userId
  }
  get currentStreak() {
    return this.#currentStreak
  }
  get longestStreak() {
    return this.#longestStreak
  }
  get lastActivityDate() {
    return this.#lastActivityDate
  }

  static async findByUserId(userId, db = pool) {
    const { rows } = await db.query('SELECT * FROM user_streaks WHERE user_id = $1', [userId])
    const r = rows[0]
    return new UserStreak(
      r
        ? { userId, currentStreak: r.current_streak, longestStreak: r.longest_streak, lastActivityDate: r.last_activity_date }
        : { userId }
    )
  }

  static async save({ userId, currentStreak, longestStreak, lastActivityDate }, db = pool) {
    await db.query(
      `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date) VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET current_streak = $2, longest_streak = $3, last_activity_date = $4`,
      [userId, currentStreak, longestStreak, lastActivityDate]
    )
  }
}
