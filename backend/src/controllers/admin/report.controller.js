import { adminReportService } from '../../services/AdminReportService.js'

export class ReportController {
  #service

  constructor(service) {
    this.#service = service
  }

  stats = async (req, res) => res.json(await this.#service.stats())

  reports = async (req, res) => res.json(await this.#service.reports(req.valid.query))
}

export default new ReportController(adminReportService)
