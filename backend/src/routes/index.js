import { Router } from 'express'
import { getHealth } from '../controllers/health.controller.js'
import adminRoutes from './admin/index.routes.js'
import authRoutes from './auth.routes.js'
import chatRoutes from './chat.routes.js'
import courseRoutes from './course.routes.js'
import learningRoutes from './learning.routes.js'
import notificationRoutes from './notification.routes.js'
import profileRoutes from './profile.routes.js'

const router = Router()

router.get('/health', getHealth)

router.use(authRoutes)
router.use(courseRoutes)
router.use(learningRoutes)
router.use('/admin', adminRoutes)
router.use(notificationRoutes)
router.use(profileRoutes)
router.use(chatRoutes)

export default router
