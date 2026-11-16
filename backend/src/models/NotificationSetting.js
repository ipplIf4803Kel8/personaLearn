import pool from '../config/db.js'

const TO_DB = { harian: 'daily', mingguan: 'weekly' }
const FROM_DB = { daily: 'harian', weekly: 'mingguan' }

export class NotificationSetting {
  #userId
  #reminderEnabled
  #reminderTime
  #frequency
  #allowPromo
  #allowChallenge

  constructor({ userId, reminderEnabled, reminderTime, frequency, allowPromo, allowChallenge }) {
    this.#userId = userId
    this.#reminderEnabled = reminderEnabled
    this.#reminderTime = reminderTime
    this.#frequency = frequency
    this.#allowPromo = allowPromo
    this.#allowChallenge = allowChallenge
  }

  get userId() { return this.#userId }
  get reminderEnabled() { return this.#reminderEnabled }
  set reminderEnabled(value) { this.#reminderEnabled = Boolean(value) }
  get reminderTime() { return this.#reminderTime }
  get frequency() { return this.#frequency }
  get allowPromo() { return this.#allowPromo }
  set allowPromo(value) { this.#allowPromo = Boolean(value) }
  get allowChallenge() { return this.#allowChallenge }
  set allowChallenge(value) { this.#allowChallenge = Boolean(value) }

  allows(type) {
    if (type === 'promo') return this.#allowPromo
    if (type === 'challenge') return this.#allowChallenge
    return true
  }

  toJSON() {
    return {
      reminderEnabled: this.#reminderEnabled,
      reminderTime: this.#reminderTime,
      frequency: this.#frequency,
      allowPromo: this.#allowPromo,
      allowChallenge: this.#allowChallenge,
    }
  }

  static fromRow(r) {
    return new NotificationSetting({
      userId: r.user_id,
      reminderEnabled: r.reminder_enabled,
      reminderTime: String(r.reminder_time).slice(0, 5),
      frequency: FROM_DB[r.frequency],
      allowPromo: r.allow_promo,
      allowChallenge: r.allow_challenge,
    })
  }

  // Baris default dibuat bila pengguna belum punya
  static async findOrCreate(userId) {
    await pool.query('INSERT INTO notification_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [userId])
    const { rows } = await pool.query('SELECT * FROM notification_settings WHERE user_id = $1', [userId])
    return NotificationSetting.fromRow(rows[0])
  }

  static async save(userId, s) {
    const { rows } = await pool.query(
      `INSERT INTO notification_settings (user_id, reminder_enabled, reminder_time, frequency, allow_promo, allow_challenge)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET reminder_enabled = $2, reminder_time = $3, frequency = $4,
         allow_promo = $5, allow_challenge = $6
       RETURNING *`,
      [userId, s.reminderEnabled, s.reminderTime, TO_DB[s.frequency], s.allowPromo, s.allowChallenge]
    )
    return NotificationSetting.fromRow(rows[0])
  }
}
