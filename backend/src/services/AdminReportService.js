import pool from '../config/db.js'
import { toCamel } from '../utils/camelCase.js'

const rowsOf = async (sql, params) => (await pool.query(sql, params)).rows

// Statistik ringkasan dashboard dan laporan admin. Semua query hanya membaca.
export class AdminReportService {
  async stats() {
    const [counts] = await rowsOf(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student')::int AS total_students,
        (SELECT COUNT(*) FROM courses)::int AS total_courses,
        (SELECT COUNT(*) FROM users WHERE role = 'student' AND last_login_at > NOW() - INTERVAL '7 days')::int AS active_students7d,
        (SELECT COUNT(*) FROM lesson_progress WHERE completed_at >= date_trunc('week', NOW()))::int AS lessons_completed_this_week`)
    const [weeklySignups, topCourses] = await Promise.all([this.#weeklySignups(), this.#topCourses()])
    return { ...toCamel(counts), weeklySignups, topCourses }
  }

  // Enam minggu terakhir, dari yang terlama; minggu tanpa pendaftar tetap muncul dengan count 0
  #weeklySignups() {
    return rowsOf(`
      SELECT 'Minggu ' || (6 - w) AS week, COUNT(u.id)::int AS count
      FROM generate_series(5, 0, -1) AS w
      LEFT JOIN users u ON u.role = 'student' AND u.created_at >= date_trunc('week', NOW()) - w * INTERVAL '1 week'
        AND u.created_at < date_trunc('week', NOW()) - (w - 1) * INTERVAL '1 week'
      GROUP BY w ORDER BY w DESC`)
  }

  async #topCourses() {
    const rows = await rowsOf(`
      SELECT c.id, c.title, s.students_count, s.rating_avg AS rating
      FROM courses c JOIN course_stats s ON s.course_id = c.id
      ORDER BY s.students_count DESC, c.id LIMIT 5`)
    return rows.map(toCamel)
  }

  // from dan to opsional (YYYY-MM-DD, tanggal akhir ikut dihitung); hanya memengaruhi bagian period.
  async reports({ from = null, to = null } = {}) {
    const [progressByCourse, rated, chatMessageStats, period] = await Promise.all([
      this.#progressByCourse(),
      this.#ratedCourses(),
      this.#chatStats(),
      this.#period(from, to),
    ])
    return {
      progressByCourse,
      highestRated: rated[0] ?? null,
      lowestRated: rated.at(-1) ?? null,
      chatMessageStats,
      period,
    }
  }

  async #progressByCourse() {
    const rows = await rowsOf(`
      SELECT c.id, c.title, COALESCE(ROUND(AVG(ep.progress_percent)), 0)::int AS average_progress,
        COUNT(ep.user_id)::int AS enrolled_count
      FROM courses c LEFT JOIN enrollment_progress ep ON ep.course_id = c.id GROUP BY c.id ORDER BY c.id`)
    return rows.map(toCamel)
  }

  // Urut dari rating tertinggi; hanya kelas yang sudah punya rating
  #ratedCourses() {
    return rowsOf(`
      SELECT c.id, c.title, s.rating_avg AS rating
      FROM courses c JOIN course_stats s ON s.course_id = c.id AND s.rating_avg IS NOT NULL
      ORDER BY s.rating_avg DESC, c.id`)
  }

  async #chatStats() {
    const [row] = await rowsOf(`
      SELECT COUNT(*)::int AS total_messages,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int AS this_week
      FROM chat_messages`)
    return toCamel(row)
  }

  async #period(from, to) {
    // `column` selalu konstanta dari kode; tanggal masuk lewat parameter
    const count = async (table, column, extra = '') => {
      const sql = `SELECT COUNT(*)::int AS n FROM ${table}
        WHERE ${extra}($1::date IS NULL OR ${column} >= $1::date) AND ($2::date IS NULL OR ${column} < $2::date + 1)`
      return (await rowsOf(sql, [from, to]))[0].n
    }
    return {
      chatMessages: await count('chat_messages', 'created_at'),
      lessonsCompleted: await count('lesson_progress', 'completed_at', 'completed_at IS NOT NULL AND '),
      newStudents: await count('users', 'created_at', "role = 'student' AND "),
    }
  }
}

export const adminReportService = new AdminReportService()
