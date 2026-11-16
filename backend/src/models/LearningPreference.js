import pool from '../config/db.js'

export default class LearningPreference {
  #userId
  #mbtiType
  #varkStyle

  constructor({ user_id, mbti_type, vark_style }) {
    this.#userId = user_id
    this.#mbtiType = mbti_type ?? null
    this.#varkStyle = vark_style ?? null
  }

  get userId() { return this.#userId }
  get mbtiType() { return this.#mbtiType }
  get varkStyle() { return this.#varkStyle }

  set mbtiType(value) { this.#mbtiType = value }
  set varkStyle(value) { this.#varkStyle = value }

  toJSON() {
    return { mbtiType: this.#mbtiType, varkStyle: this.#varkStyle }
  }

  // Pelajar yang belum mengisi dianggap punya preferensi kosong.
  static async findByUserId(userId) {
    const { rows } = await pool.query('SELECT * FROM learning_preferences WHERE user_id = $1', [userId])
    return new LearningPreference(rows[0] ?? { user_id: userId })
  }

  async save() {
    await pool.query(
      `INSERT INTO learning_preferences (user_id, mbti_type, vark_style) VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET mbti_type = EXCLUDED.mbti_type, vark_style = EXCLUDED.vark_style`,
      [this.#userId, this.#mbtiType, this.#varkStyle]
    )
    return this
  }
}
