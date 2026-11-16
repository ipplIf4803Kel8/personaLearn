import { Router } from 'express'
import c from '../../controllers/admin/student.controller.js'
import { validate } from '../../middlewares/validate.js'
import { idParams, studentStatusBody } from '../../validators/admin.validators.js'

const router = Router()

router.get('/students', c.list)
router.get('/students/:id', validate({ params: idParams }), c.detail)
// /active dipertahankan karena dipakai frontend admin yang sudah ada
router.patch('/students/:id/status', validate({ params: idParams, body: studentStatusBody }), c.setStatus)
router.patch('/students/:id/active', validate({ params: idParams, body: studentStatusBody }), c.setStatus)

export default router
