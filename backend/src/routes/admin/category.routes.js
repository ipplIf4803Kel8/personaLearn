import { Router } from 'express'
import c from '../../controllers/admin/category.controller.js'
import { validate } from '../../middlewares/validate.js'
import { categoryBody, categoryPatch, idParams } from '../../validators/admin.validators.js'

const router = Router()

router.get('/categories', c.list)
router.post('/categories', validate({ body: categoryBody }), c.create)
router.patch('/categories/:id', validate({ params: idParams, body: categoryPatch }), c.update)
router.delete('/categories/:id', validate({ params: idParams }), c.delete)

export default router
