import { Router } from 'express'
import c from '../../controllers/admin/report.controller.js'
import { validate } from '../../middlewares/validate.js'
import { reportQuery } from '../../validators/admin.validators.js'

const router = Router()

router.get('/stats', c.stats)
router.get('/reports', validate({ query: reportQuery }), c.reports)

export default router
