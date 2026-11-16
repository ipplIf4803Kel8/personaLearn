import pool from '../config/db.js'
import { LessonProgress } from '../models/LessonProgress.js'
import { notifyUser } from '../utils/notifyUser.js'
import { PointService } from './PointService.js'
import { StreakService } from './StreakService.js'

const fail = (status, message) => Object.assign(new Error(message), { status })

const LESSON_COLUMNS = `l.id, l.course_id, l.title, l.description, l.video_url, l.duration_seconds, l.position, c.title AS course_title`

export class ProgressService {
  #db

  constructor(db = pool) {
    this.#db = db
  }

  static percent(completed, total) {
    return total === 0 ? 0 : Math.round((100 * completed) / total)
  }

  // lessons sudah terurut berdasarkan posisi; hasilnya id pelajaran pertama yang belum selesai.
  static nextLessonId(lessons, completedIds) {
    const done = new Set(completedIds)
    return lessons.find((l) => !done.has(l.id))?.id ?? null
  }

  async listEnrollments(userId) {
    const { rows } = await this.#db.query(
      `SELECT c.id AS course_id, c.title, c.thumbnail_url, c.level, cat.name AS category_name,
         ep.total_lessons, ep.completed_lessons, ep.progress_percent, e.completed_at,
         (SELECT MAX(lp.updated_at) FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
          WHERE lp.user_id = e.user_id AND l.course_id = e.course_id) AS last_activity_at
       FROM enrollments e
       JOIN enrollment_progress ep ON ep.enrollment_id = e.id
       JOIN courses c ON c.id = e.course_id
       JOIN categories cat ON cat.id = c.category_id
       WHERE e.user_id = $1
       ORDER BY last_activity_at DESC NULLS LAST, e.created_at DESC, e.id DESC`,
      [userId]
    )
    return rows.map(camel)
  }

  async getEnrollment(userId, courseId) {
    const { rows } = await this.#db.query(
      `SELECT c.id AS course_id, c.title, c.description, c.thumbnail_url, c.level, cat.name AS category_name,
         s.rating_avg AS rating, s.students_count, ep.total_lessons, ep.completed_lessons, ep.progress_percent, e.completed_at
       FROM enrollments e
       JOIN enrollment_progress ep ON ep.enrollment_id = e.id
       JOIN courses c ON c.id = e.course_id
       JOIN categories cat ON cat.id = c.category_id
       JOIN course_stats s ON s.course_id = c.id
       WHERE e.user_id = $1 AND e.course_id = $2`,
      [userId, courseId]
    )
    if (!rows[0]) throw fail(404, 'Kelas belum Anda ambil')
    const { rows: lessons } = await this.#db.query(
      `SELECT l.id, l.title, l.duration_seconds, l.position, (lp.completed_at IS NOT NULL) AS completed
       FROM lessons l LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = $1
       WHERE l.course_id = $2 ORDER BY l.position, l.id`,
      [userId, courseId]
    )
    const nextLessonId = ProgressService.nextLessonId(lessons, lessons.filter((l) => l.completed).map((l) => l.id))
    return { ...camel(rows[0]), lessons: lessons.map(camel), nextLessonId }
  }

  // Pelajaran hanya boleh dibuka pemilik enrollment kelasnya.
  async #findAccessibleLesson(userId, lessonId) {
    const { rows } = await this.#db.query(
      `SELECT ${LESSON_COLUMNS}, (SELECT COUNT(*)::int FROM lessons WHERE course_id = l.course_id) AS total_lessons,
         (SELECT COUNT(*)::int FROM lessons x WHERE x.course_id = l.course_id AND (x.position, x.id) <= (l.position, l.id)) AS number,
         EXISTS (SELECT 1 FROM enrollments e WHERE e.user_id = $2 AND e.course_id = l.course_id) AS enrolled
       FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = $1`,
      [lessonId, userId]
    )
    if (!rows[0]) throw fail(404, 'Pelajaran tidak ditemukan')
    if (!rows[0].enrolled) throw fail(403, 'Ambil kelas ini dulu untuk membuka pelajaran')
    return rows[0]
  }

  // Posisi yang jelas tidak masuk akal ditolak: lewat durasi + 60 detik, atau maks 24 jam bila durasi tidak diketahui.
  static #checkPosition(lesson, positionSeconds) {
    if (positionSeconds == null) return
    const max = lesson.duration_seconds > 0 ? lesson.duration_seconds + 60 : 86400
    if (positionSeconds > max) throw fail(422, 'Posisi video melebihi durasi pelajaran')
  }

  async getLesson(userId, lessonId) {
    const lesson = await this.#findAccessibleLesson(userId, lessonId)
    const [progress, reactions] = await Promise.all([
      LessonProgress.find(userId, lessonId, this.#db),
      LessonProgress.reactionSummary(userId, lessonId, this.#db),
    ])
    const { enrolled, ...rest } = lesson
    return {
      ...camel(rest),
      completed: progress?.isCompleted ?? false,
      lastPositionSeconds: progress?.lastPositionSeconds ?? 0,
      ...reactions,
    }
  }

  async savePosition(userId, lessonId, positionSeconds) {
    ProgressService.#checkPosition(await this.#findAccessibleLesson(userId, lessonId), positionSeconds)
    await LessonProgress.savePosition(userId, lessonId, positionSeconds, this.#db)
    return { lessonId, lastPositionSeconds: positionSeconds }
  }

  async setReaction(userId, lessonId, reaction) {
    await this.#findAccessibleLesson(userId, lessonId)
    if (reaction) await LessonProgress.setReaction(userId, lessonId, reaction, this.#db)
    else await LessonProgress.clearReaction(userId, lessonId, this.#db)
    return LessonProgress.reactionSummary(userId, lessonId, this.#db)
  }

  // Idempoten: poin dan streak hanya bertambah pada penyelesaian pertama.
  async completeLesson(userId, lessonId, { positionSeconds, today = StreakService.today() } = {}) {
    const lesson = await this.#findAccessibleLesson(userId, lessonId)
    ProgressService.#checkPosition(lesson, positionSeconds)
    const client = await this.#db.connect()
    let result
    try {
      await client.query('BEGIN')
      const first = await LessonProgress.markCompleted(userId, lessonId, positionSeconds, client)
      let pointsEarned = 0
      if (first) {
        pointsEarned = await new PointService(client).award(userId, 'lesson', lessonId)
        await new StreakService(client).record(userId, today)
      }
      const { rows } = await client.query(
        'SELECT enrollment_id, total_lessons, completed_lessons, progress_percent FROM enrollment_progress WHERE user_id = $1 AND course_id = $2',
        [userId, lesson.course_id]
      )
      const progress = rows[0]
      let courseCompleted = false
      if (first && progress.completed_lessons === progress.total_lessons) {
        const done = await client.query('UPDATE enrollments SET completed_at = NOW() WHERE id = $1 AND completed_at IS NULL', [progress.enrollment_id])
        courseCompleted = done.rowCount === 1
      }
      await client.query('COMMIT')
      result = { lesson, first, pointsEarned, progress, courseCompleted }
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {})
      throw err
    } finally {
      client.release()
    }
    return this.#buildCompleteResult(userId, result)
  }

  async #buildCompleteResult(userId, { lesson, first, pointsEarned, progress, courseCompleted }) {
    if (courseCompleted) {
      await notifyUser(userId, {
        type: 'course_completed',
        title: 'Selamat, kelas selesai',
        body: `Kamu sudah menyelesaikan semua pelajaran di kelas ${lesson.course_title}.`,
      })
    }
    const [totalPoints, streak, course] = await Promise.all([
      new PointService(this.#db).total(userId),
      new StreakService(this.#db).current(userId),
      this.getEnrollment(userId, lesson.course_id),
    ])
    return {
      lessonId: lesson.id,
      alreadyCompleted: !first,
      pointsEarned,
      totalPoints,
      streak: streak.currentStreak,
      progress: {
        completedLessons: progress.completed_lessons,
        totalLessons: progress.total_lessons,
        progressPercent: progress.progress_percent,
      },
      courseCompleted,
      nextLessonId: course.nextLessonId,
    }
  }

  // Ringkasan untuk Kelas Saya dan Statistik Belajar: poin, streak, kelas aktif, dan pelajaran selesai per hari.
  async getStats(userId, today = StreakService.today()) {
    const [points, streak, active, activity] = await Promise.all([
      new PointService(this.#db).total(userId),
      new StreakService(this.#db).current(userId, today),
      this.#db.query('SELECT COUNT(*)::int AS n FROM enrollments WHERE user_id = $1 AND completed_at IS NULL', [userId]),
      this.#db.query(
        `SELECT lp.completed_at::date AS date, COUNT(*)::int AS lessons, COALESCE(SUM(l.duration_seconds), 0)::int AS seconds
         FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
         WHERE lp.user_id = $1 AND lp.completed_at IS NOT NULL AND lp.completed_at::date > $2::date - 30
         GROUP BY 1 ORDER BY 1 DESC`,
        [userId, today]
      ),
    ])
    return {
      totalPoints: points,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      activeCourses: active.rows[0].n,
      activity: activity.rows,
    }
  }
}

const camel = (row) =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), v]))
