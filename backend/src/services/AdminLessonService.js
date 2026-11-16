import { Lesson } from '../models/Lesson.js'
import { HttpError } from '../utils/httpError.js'

// Pembuatan pelajaran ada di CourseService.addLesson; di sini daftar, ubah, hapus, dan urutan.
export class AdminLessonService {
  list(courseId) {
    return Lesson.listAdmin(courseId)
  }

  async update(id, data) {
    const lesson = await Lesson.update(id, data)
    if (!lesson) throw new HttpError(404, 'Pelajaran tidak ditemukan')
    return lesson
  }

  async delete(id) {
    if (!(await Lesson.delete(id))) throw new HttpError(404, 'Pelajaran tidak ditemukan')
  }

  // Id ganda atau id milik kelas lain ditolak; daftar sebagian boleh, sisanya menyusul
  async reorder(courseId, ids) {
    const owned = new Set(await Lesson.idsOfCourse(courseId))
    if (new Set(ids).size !== ids.length) throw new HttpError(422, 'Daftar pelajaran memuat id ganda')
    if (ids.some((id) => !owned.has(id))) throw new HttpError(422, 'Ada pelajaran yang bukan milik kelas ini')
    return Lesson.reorder(courseId, ids)
  }
}

export const adminLessonService = new AdminLessonService()
