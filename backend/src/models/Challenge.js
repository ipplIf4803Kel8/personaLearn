import pool from '../config/db.js'
import { toCamel } from '../utils/camelCase.js'
import { updateRow } from '../utils/sqlUpdate.js'

const COLUMNS = {
  title: 'title',
  description: 'description',
  rewardPoints: 'reward_points',
  startsAt: 'starts_at',
  endsAt: 'ends_at',
  courseId: 'course_id',
}

export class Challenge {
  #id
  #title
  #description
  #rewardPoints
  #startsAt
  #endsAt
  #courseId

  constructor({ id, title, description = '', rewardPoints = 0, startsAt, endsAt, courseId = null }) {
    this.#id = id
    this.#title = title
    this.#description = description
    this.#rewardPoints = rewardPoints
    this.#startsAt = startsAt
    this.#endsAt = endsAt
    this.#courseId = courseId
  }

  get id() {
    return this.#id
  }
  get title() {
    return this.#title
  }
  get description() {
    return this.#description
  }
  get rewardPoints() {
    return this.#rewardPoints
  }
  get startsAt() {
    return this.#startsAt
  }
  get endsAt() {
    return this.#endsAt
  }
  get courseId() {
    return this.#courseId
  }

  // today berupa 'YYYY-MM-DD'; batas awal dan akhir ikut dihitung aktif.
  isActiveOn(today) {
    return this.#startsAt <= today && today <= this.#endsAt
  }

  toJSON() {
    return {
      id: this.#id,
      title: this.#title,
      description: this.#description,
      rewardPoints: this.#rewardPoints,
      startsAt: this.#startsAt,
      endsAt: this.#endsAt,
      courseId: this.#courseId,
    }
  }

  static from(r) {
    return r && new Challenge({
      id: r.id,
      title: r.title,
      description: r.description,
      rewardPoints: r.reward_points,
      startsAt: r.starts_at,
      endsAt: r.ends_at,
      courseId: r.course_id,
    })
  }

  static async findById(id, db = pool) {
    const { rows } = await db.query('SELECT * FROM challenges WHERE id = $1', [id])
    return Challenge.from(rows[0])
  }

  // Tantangan yang periodenya mencakup today, beserta status selesai milik userId.
  static async listActive(userId, today, db = pool) {
    const { rows } = await db.query(
      `SELECT ch.*, (cc.id IS NOT NULL) AS completed
       FROM challenges ch
       LEFT JOIN challenge_completions cc ON cc.challenge_id = ch.id AND cc.user_id = $1
       WHERE $2::date BETWEEN ch.starts_at AND ch.ends_at
       ORDER BY ch.ends_at, ch.id`,
      [userId, today]
    )
    return rows.map((r) => ({ ...Challenge.from(r).toJSON(), completed: r.completed }))
  }

  // true hanya untuk penyelesaian pertama.
  static async markCompleted(userId, challengeId, db = pool) {
    const { rowCount } = await db.query(
      'INSERT INTO challenge_completions (user_id, challenge_id) VALUES ($1, $2) ON CONFLICT (user_id, challenge_id) DO NOTHING',
      [userId, challengeId]
    )
    return rowCount === 1
  }

  // Bagian admin: bentuk baris apa adanya (camelCase)
  static async listAdmin() {
    const { rows } = await pool.query('SELECT * FROM challenges ORDER BY id')
    return rows.map(toCamel)
  }

  static async insert(data) {
    const keys = Object.keys(COLUMNS).filter((k) => data[k] !== undefined)
    const { rows } = await pool.query(
      `INSERT INTO challenges (${keys.map((k) => COLUMNS[k]).join(', ')})
       VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
      keys.map((k) => data[k])
    )
    return toCamel(rows[0])
  }

  static update(id, data) {
    return updateRow('challenges', COLUMNS, id, data)
  }

  static async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM challenges WHERE id = $1', [id])
    return rowCount > 0
  }
}
