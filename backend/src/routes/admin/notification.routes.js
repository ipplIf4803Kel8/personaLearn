import { Router } from 'express'
import c from '../../controllers/admin/notification.controller.js'
import { validate } from '../../middlewares/validate.js'
import { idParams, notificationBody } from '../../validators/admin.validators.js'

const router = Router()

router.get('/notifications', c.list)
router.post('/notifications', validate({ body: notificationBody }), c.send)
router.delete('/notifications/:id', validate({ params: idParams }), c.delete)

export default router
