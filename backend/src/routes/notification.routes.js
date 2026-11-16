import { Router } from 'express'
import * as c from '../controllers/notification.controller.js'
import { requireAuth } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { idParams, listQuery, settingsBody } from '../validators/notification.validators.js'

const router = Router()

router.get('/notifications', requireAuth, validate({ query: listQuery }), c.list)
router.patch('/notifications/read-all', requireAuth, c.markAllRead)
router.get('/notifications/:id', requireAuth, validate({ params: idParams }), c.detail)
router.patch('/notifications/:id/read', requireAuth, validate({ params: idParams }), c.markRead)

router.get('/me/notification-settings', requireAuth, c.getSettings)
router.put('/me/notification-settings', requireAuth, validate({ body: settingsBody }), c.updateSettings)

export default router
