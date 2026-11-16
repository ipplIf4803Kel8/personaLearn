import { Router } from 'express'
import auth from '../controllers/auth.controller.js'
import { limitForgotPassword, limitLogin, limitResetPassword, requireAuth } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import {
  forgotPasswordSchema,
  loginSchema,
  preferencesSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validators/auth.validators.js'

const router = Router()

router.post('/auth/register', validate({ body: registerSchema }), auth.register)
router.post('/auth/login', limitLogin, validate({ body: loginSchema }), auth.login)
router.get('/auth/me', requireAuth, auth.me)
router.post('/auth/forgot-password', limitForgotPassword, validate({ body: forgotPasswordSchema }), auth.forgotPassword)
router.post('/auth/reset-password', limitResetPassword, validate({ body: resetPasswordSchema }), auth.resetPassword)

router.get('/me/preferences', requireAuth, auth.getPreferences)
router.put('/me/preferences', requireAuth, validate({ body: preferencesSchema }), auth.savePreferences)

export default router
