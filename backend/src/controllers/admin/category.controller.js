import { adminCategoryService } from '../../services/AdminCategoryService.js'

// Respons admin berupa payload apa adanya (bukan { data, message }) karena begitu dibaca frontend admin.
export class CategoryController {
  #service

  constructor(service) {
    this.#service = service
  }

  list = async (req, res) => res.json(await this.#service.list())

  create = async (req, res) => res.status(201).json(await this.#service.create(req.valid.body))

  update = async (req, res) => res.json(await this.#service.update(req.valid.params.id, req.valid.body))

  delete = async (req, res) => {
    await this.#service.delete(req.valid.params.id)
    res.status(204).end()
  }
}

export default new CategoryController(adminCategoryService)
