import pool from '../config/db.js'
import { toCamel } from '../utils/camelCase.js'

// Pelajar dilihat dari sisi admin. password_hash tidak pernah dipilih.
const COLUMNS = 'u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active, u.created_at, lp.mbti_type, lp.vark_style'

export class Student {
  static async list() {
    const { rows } = await pool.query(
      `SELECT ${COLUMNS},
        COALESCE(json_agg(json_build_object('courseId', ep.course_id, 'progressPercent', ep.progress_percent))
          FILTER (WHERE ep.course_id IS NOT NULL), '[]') AS enrollments
       FROM users u
       LEFT JOIN learning_preferences lp ON lp.user_id = u.id
       LEFT JOIN enrollment_progress ep ON ep.user_id = u.id
       WHERE u.role = 'student' GROUP BY u.id, lp.id ORDER BY u.id`
    )
    return rows.map(toCamel)
  }

  // Profil, preferensi, serta kelas dan progres per kelas.
  static async findDetail(id) {
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM users u LEFT JOIN learning_preferences lp ON lp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'student'`,
      [id]
    )
    if (!rows[0]) return null
    const student = toCamel(rows[0])
    const enrollments = await pool.query(
      `SELECT ep.course_id, c.title, ep.total_lessons, ep.completed_lessons, ep.progress_percent, e.enrolled_at, e.completed_at
       FROM enrollment_progress ep JOIN courses c ON c.id = ep.course_id JOIN enrollments e ON e.id = ep.enrollment_id
       WHERE ep.user_id = $1 ORDER BY e.enrolled_at DESC, ep.course_id`,
      [id]
    )
    return {
      ...student,
      preferences: { mbtiType: student.mbtiType, varkStyle: student.varkStyle },
      enrollments: enrollments.rows.map(toCamel),
    }
  }

  static async setActive(id, isActive) {
    const { rows } = await pool.query(
      `UPDATE users SET is_active = $1 WHERE id = $2 AND role = 'student' RETURNING id, is_active`,
      [isActive, id]
    )
    return rows[0] ? toCamel(rows[0]) : null
  }

  static async exists(id) {
    const { rowCount } = await pool.query(`SELECT 1 FROM users WHERE id = $1 AND role = 'student'`, [id])
    return rowCount > 0
  }
}
