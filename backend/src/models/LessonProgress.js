import pool from '../config/db.js'

// Satu baris per pengguna dan pelajaran. completed_at kosong berarti baru dibuka.
export class LessonProgress {
  #id
  #userId
  #lessonId
  #completedAt
  #lastPositionSeconds

  constructor({ id, userId, lessonId, completedAt = null, lastPositionSeconds = 0 }) {
    this.#id = id
    this.#userId = userId
    this.#lessonId = lessonId
    this.#completedAt = completedAt
    this.#lastPositionSeconds = lastPositionSeconds
  }

  get id() {
    return this.#id
  }
  get userId() {
    return this.#userId
  }
  get lessonId() {
    return this.#lessonId
  }
  get completedAt() {
    return this.#completedAt
  }
  get isCompleted() {
    return this.#completedAt !== null
  }
  get lastPositionSeconds() {
    return this.#lastPositionSeconds
  }
  set lastPositionSeconds(value) {
    if (!Number.isInteger(value) || value < 0) throw new Error('Posisi video tidak valid')
    this.#lastPositionSeconds = value
  }

  static from(row) {
    return row && new LessonProgress({
      id: row.id,
      userId: row.user_id,
      lessonId: row.lesson_id,
      completedAt: row.completed_at,
      lastPositionSeconds: row.last_position_seconds,
    })
  }

  static async find(userId, lessonId, db = pool) {
    const { rows } = await db.query('SELECT * FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2', [userId, lessonId])
    return LessonProgress.from(rows[0])
  }

  // Menandai selesai. Mengembalikan true hanya pada pemanggilan pertama, sehingga aman dipanggil berulang.
  static async markCompleted(userId, lessonId, positionSeconds, db = pool) {
    await db.query(
      `INSERT INTO lesson_progress (user_id, lesson_id) VALUES ($1, $2)
       ON CONFLICT (user_id, lesson_id) DO NOTHING`,
      [userId, lessonId]
    )
    const { rowCount } = await db.query(
      `UPDATE lesson_progress
       SET completed_at = NOW(), last_position_seconds = COALESCE($3, last_position_seconds)
       WHERE user_id = $1 AND lesson_id = $2 AND completed_at IS NULL`,
      [userId, lessonId, positionSeconds ?? null]
    )
    return rowCount === 1
  }

  // Hanya menyimpan posisi; completed_at tidak pernah disentuh.
  static async savePosition(userId, lessonId, positionSeconds, db = pool) {
    await db.query(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed_at, last_position_seconds) VALUES ($1, $2, NULL, $3)
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET last_position_seconds = EXCLUDED.last_position_seconds`,
      [userId, lessonId, positionSeconds]
    )
  }

  static async setReaction(userId, lessonId, reaction, db = pool) {
    await db.query(
      `INSERT INTO lesson_reactions (user_id, lesson_id, reaction) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET reaction = EXCLUDED.reaction`,
      [userId, lessonId, reaction]
    )
  }

  static async clearReaction(userId, lessonId, db = pool) {
    await db.query('DELETE FROM lesson_reactions WHERE user_id = $1 AND lesson_id = $2', [userId, lessonId])
  }

  static async reactionSummary(userId, lessonId, db = pool) {
    const { rows } = await db.query(
      `SELECT COUNT(*) FILTER (WHERE reaction = 'like')::int AS likes,
              COUNT(*) FILTER (WHERE reaction = 'dislike')::int AS dislikes,
              MAX(reaction) FILTER (WHERE user_id = $1) AS mine
       FROM lesson_reactions WHERE lesson_id = $2`,
      [userId, lessonId]
    )
    return { likes: rows[0].likes, dislikes: rows[0].dislikes, myReaction: rows[0].mine }
  }
}
