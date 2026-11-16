import { adminNotificationService } from '../../services/AdminNotificationService.js'

export class AdminNotificationController {
  #service

  constructor(service) {
    this.#service = service
  }

  list = async (req, res) => res.json(await this.#service.list())

  send = async (req, res) => res.status(201).json(await this.#service.send(req.valid.body))

  delete = async (req, res) => {
    await this.#service.delete(req.valid.params.id)
    res.status(204).end()
  }
}

export default new AdminNotificationController(adminNotificationService)
