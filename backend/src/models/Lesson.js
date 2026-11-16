import pool from '../config/db.js'
import { toCamel } from '../utils/camelCase.js'
import { updateRow } from '../utils/sqlUpdate.js'

const COLUMNS = { title: 'title', description: 'description', videoUrl: 'video_url', durationSeconds: 'duration_seconds' }

export class Lesson {
  #id
  #courseId
  #title
  #description
  #videoUrl
  #durationSeconds
  #position

  constructor({ id, courseId, title, description = '', videoUrl = '', durationSeconds = 0, position = 0 }) {
    this.#id = id
    this.#courseId = courseId
    this.#title = title
    this.#description = description
    this.#videoUrl = videoUrl
    this.#durationSeconds = durationSeconds
    this.#position = position
  }

  get id() {
    return this.#id
  }
  get courseId() {
    return this.#courseId
  }
  get title() {
    return this.#title
  }
  set title(value) {
    this.#title = value
  }
  get description() {
    return this.#description
  }
  set description(value) {
    this.#description = value
  }
  get videoUrl() {
    return this.#videoUrl
  }
  set videoUrl(value) {
    this.#videoUrl = value
  }
  get durationSeconds() {
    return this.#durationSeconds
  }
  get position() {
    return this.#position
  }

  toJSON() {
    return {
      id: this.#id,
      title: this.#title,
      description: this.#description,
      videoUrl: this.#videoUrl,
      durationSeconds: this.#durationSeconds,
      position: this.#position,
    }
  }

  static async findByCourse(courseId) {
    const { rows } = await pool.query(
      `SELECT id, course_id, title, description, video_url, duration_seconds, position
       FROM lessons WHERE course_id = $1 ORDER BY position, id`,
      [courseId]
    )
    return rows.map((row) => new Lesson(toCamel(row)))
  }

  // Bagian admin: bentuk baris apa adanya (camelCase)
  static async listAdmin(courseId) {
    const { rows } = await pool.query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY position, id', [courseId])
    return rows.map(toCamel)
  }

  static update(id, data) {
    return updateRow('lessons', COLUMNS, id, data)
  }

  static async delete(id) {
    const { rows } = await pool.query('DELETE FROM lessons WHERE id = $1 RETURNING course_id', [id])
    if (!rows[0]) return false
    await Lesson.reorder(rows[0].course_id, [])
    return true
  }

  static async idsOfCourse(courseId) {
    const { rows } = await pool.query('SELECT id FROM lessons WHERE course_id = $1', [courseId])
    return rows.map((row) => row.id)
  }

  // ids adalah urutan baru; id yang bukan milik kelas diabaikan
  static async reorder(courseId, ids) {
    // Id yang disebut didahulukan; sisanya menyusul. Hasilnya selalu 1..n tanpa duplikat.
    await pool.query(
      `WITH given AS (SELECT id, MIN(pos) AS pos FROM unnest($1::int[]) WITH ORDINALITY AS v(id, pos) GROUP BY id),
       ordered AS (
         SELECT l.id, ROW_NUMBER() OVER (ORDER BY COALESCE(g.pos, 1000000), l.position, l.id) AS rn
         FROM lessons l LEFT JOIN given g ON g.id = l.id WHERE l.course_id = $2
       )
       UPDATE lessons SET position = ordered.rn FROM ordered WHERE lessons.id = ordered.id`,
      [ids, courseId]
    )
  }

  // Pratinjau untuk calon peserta: pelajaran pertama dari kelas yang terbit.
  static async findPreview(courseId) {
    const { rows } = await pool.query(
      `SELECT l.id, l.course_id, l.title, l.description, l.video_url, l.duration_seconds, l.position
       FROM lessons l JOIN courses c ON c.id = l.course_id
       WHERE l.course_id = $1 AND c.is_published ORDER BY l.position, l.id LIMIT 1`,
      [courseId]
    )
    return rows[0] ? new Lesson(toCamel(rows[0])) : null
  }
}
