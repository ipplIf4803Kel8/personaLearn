import { Router } from 'express'
import * as c from '../controllers/profile.controller.js'
import { requireAuth } from '../middlewares/auth.js'
import { uploadAvatar } from '../middlewares/upload.js'
import { validate } from '../middlewares/validate.js'
import { passwordBody, profileBody } from '../validators/profile.validators.js'

const router = Router()

router.get('/me/profile', requireAuth, c.getProfile)
router.put('/me/profile', requireAuth, validate({ body: profileBody }), c.updateProfile)
router.put('/me/password', requireAuth, validate({ body: passwordBody }), c.changePassword)
router.post('/me/avatar', requireAuth, uploadAvatar, c.uploadAvatar)
router.delete('/me/avatar', requireAuth, c.removeAvatar)

export default router
