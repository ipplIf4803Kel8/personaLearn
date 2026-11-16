import { adminStudentService } from '../../services/AdminStudentService.js'

export class StudentController {
  #service

  constructor(service) {
    this.#service = service
  }

  list = async (req, res) => res.json(await this.#service.list())

  detail = async (req, res) => res.json(await this.#service.getDetail(req.valid.params.id))

  setStatus = async (req, res) =>
    res.json(await this.#service.setActive(req.valid.params.id, req.valid.body.isActive))
}

export default new StudentController(adminStudentService)
