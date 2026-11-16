import { Student } from '../models/Student.js'
import { HttpError } from '../utils/httpError.js'

export class AdminStudentService {
  list() {
    return Student.list()
  }

  async getDetail(id) {
    const student = await Student.findDetail(id)
    if (!student) throw new HttpError(404, 'Pelajar tidak ditemukan')
    return student
  }

  async setActive(id, isActive) {
    const result = await Student.setActive(id, isActive)
    if (!result) throw new HttpError(404, 'Pelajar tidak ditemukan')
    return result
  }
}

export const adminStudentService = new AdminStudentService()
