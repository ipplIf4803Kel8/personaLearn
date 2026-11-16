import { courseService } from '../../services/CourseService.js'
import { adminLessonService } from '../../services/AdminLessonService.js'

// Kelas dan pelajaran milik kelas. Kelas lewat CourseService karena ikut mengurus tag.
export class AdminCourseController {
  #courses
  #lessons

  constructor(courses, lessons) {
    this.#courses = courses
    this.#lessons = lessons
  }

  list = async (req, res) => res.json(await this.#courses.listAdmin())

  create = async (req, res) => res.status(201).json(await this.#courses.create(req.valid.body))

  update = async (req, res) => res.json(await this.#courses.update(req.valid.params.id, req.valid.body))

  delete = async (req, res) => {
    await this.#courses.delete(req.valid.params.id)
    res.status(204).end()
  }

  listLessons = async (req, res) => res.json(await this.#lessons.list(req.valid.params.id))

  createLesson = async (req, res) => res.status(201).json(await this.#courses.addLesson(req.valid.params.id, req.valid.body))

  reorderLessons = async (req, res) => {
    await this.#lessons.reorder(req.valid.params.id, req.valid.body.ids)
    res.status(204).end()
  }

  updateLesson = async (req, res) => res.json(await this.#lessons.update(req.valid.params.id, req.valid.body))

  deleteLesson = async (req, res) => {
    await this.#lessons.delete(req.valid.params.id)
    res.status(204).end()
  }
}

export default new AdminCourseController(courseService, adminLessonService)
