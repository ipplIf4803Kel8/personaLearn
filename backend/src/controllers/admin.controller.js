import pool from '../config/db.js'
import { crud, toCamel } from '../services/crud.service.js'

export const categories = crud('categories', ['name', 'slug'], { required: ['name', 'slug'] })

export const courses = crud(
  'courses',
  ['categoryId', 'title', 'description', 'level', 'thumbnailUrl', 'isPublished', 'varkTags', 'personalityTags'],
  {
    required: ['categoryId', 'title'],
    listSql: `SELECT c.*, COUNT(e.user_id)::int AS students_count, ROUND(AVG(e.rating), 1)::float AS rating
              FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
              GROUP BY c.id ORDER BY c.id`,
  }
)

export const challenges = crud(
  'challenges',
  ['title', 'description', 'rewardPoints', 'startsAt', 'endsAt', 'courseId'],
  { required: ['title', 'startsAt', 'endsAt'] }
)

export const lessons = crud('lessons', ['title', 'videoUrl', 'durationSeconds', 'description'], {
  required: ['title'],
})

export async function listLessons(req, res) {
  const { rows } = await pool.query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY position, id', [req.params.id])
  res.json(rows.map(toCamel))
}

export async function createLesson(req, res) {
  const { title, videoUrl = '', durationSeconds = 0, description = '' } = req.body
  if (!title?.trim()) return res.status(400).json({ message: 'Field wajib diisi: title' })
  const { rows } = await pool.query(
    `INSERT INTO lessons (course_id, title, video_url, duration_seconds, description, position)
     VALUES ($1, $2, $3, $4, $5, COALESCE((SELECT MAX(position) FROM lessons WHERE course_id = $1), 0) + 1)
     RETURNING *`,
    [req.params.id, title.trim(), videoUrl, durationSeconds, description]
  )
  res.status(201).json(toCamel(rows[0]))
}

// body: { ids: [urutan id pelajaran yang baru] }
export async function reorderLessons(req, res) {
  const ids = req.body.ids
  if (!Array.isArray(ids)) return res.status(400).json({ message: 'ids harus berupa array' })
  await pool.query(
    `UPDATE lessons SET position = v.pos FROM unnest($1::int[]) WITH ORDINALITY AS v(id, pos)
     WHERE lessons.id = v.id AND lessons.course_id = $2`,
    [ids, req.params.id]
  )
  res.status(204).end()
}

export const notifications = crud('notifications', ['title', 'body', 'audience'], {
  required: ['title', 'body'],
  listSql: 'SELECT * FROM notifications ORDER BY sent_at DESC',
})

const one = async (sql) => (await pool.query(sql)).rows

export async function getStats(req, res) {
  const [stats] = await one(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'student')::int AS total_students,
      (SELECT COUNT(*) FROM courses)::int AS total_courses,
      (SELECT COUNT(*) FROM users WHERE role = 'student' AND last_login_at > NOW() - INTERVAL '7 days')::int AS active_students7d,
      (SELECT COUNT(*) FROM lesson_progress WHERE completed_at > NOW() - INTERVAL '7 days')::int AS lessons_completed_this_week`)
  const weeklySignups = await one(`
    SELECT 'Minggu ' || (6 - w) AS week, COUNT(u.id)::int AS count
    FROM generate_series(5, 0, -1) AS w
    LEFT JOIN users u ON u.role = 'student' AND u.created_at >= date_trunc('week', NOW()) - w * INTERVAL '1 week'
      AND u.created_at < date_trunc('week', NOW()) - (w - 1) * INTERVAL '1 week'
    GROUP BY w ORDER BY w DESC`)
  const topCourses = await one(`
    SELECT c.id, c.title, COUNT(e.user_id)::int AS students_count, ROUND(AVG(e.rating), 1)::float AS rating
    FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
    GROUP BY c.id ORDER BY students_count DESC LIMIT 5`)
  res.json({ ...toCamel(stats), weeklySignups, topCourses: topCourses.map(toCamel) })
}

export async function listStudents(req, res) {
  const rows = await one(`
    SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active, u.mbti_type, u.vark_style,
      COALESCE(json_agg(json_build_object('courseId', e.course_id, 'progressPercent', e.progress_percent))
        FILTER (WHERE e.course_id IS NOT NULL), '[]') AS enrollments
    FROM users u LEFT JOIN enrollments e ON e.user_id = u.id
    WHERE u.role = 'student' GROUP BY u.id ORDER BY u.id`)
  res.json(rows.map(toCamel))
}

export async function setStudentActive(req, res) {
  const { rows } = await pool.query(
    `UPDATE users SET is_active = $1 WHERE id = $2 AND role = 'student' RETURNING id, is_active`,
    [Boolean(req.body.isActive), req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ message: 'Pelajar tidak ditemukan' })
  res.json(toCamel(rows[0]))
}

export async function getReports(req, res) {
  const progressByCourse = await one(`
    SELECT c.id, c.title, COALESCE(ROUND(AVG(e.progress_percent)), 0)::int AS average_progress,
      COUNT(e.user_id)::int AS enrolled_count
    FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id GROUP BY c.id ORDER BY c.id`)
  const rated = await one(`
    SELECT c.id, c.title, ROUND(AVG(e.rating), 1)::float AS rating
    FROM courses c JOIN enrollments e ON e.course_id = c.id AND e.rating IS NOT NULL
    GROUP BY c.id ORDER BY rating DESC`)
  const [chat] = await one(`
    SELECT COUNT(*)::int AS total_messages,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int AS this_week
    FROM chat_messages`)
  res.json({
    progressByCourse: progressByCourse.map(toCamel),
    highestRated: rated[0] ?? null,
    lowestRated: rated.at(-1) ?? null,
    chatMessageStats: toCamel(chat),
  })
}
