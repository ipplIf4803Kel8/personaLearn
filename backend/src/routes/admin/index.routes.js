import { Router } from 'express'
import { requireAdmin, requireAuth } from '../../middlewares/auth.js'
import categoryRoutes from './category.routes.js'
import challengeRoutes from './challenge.routes.js'
import courseRoutes from './course.routes.js'
import notificationRoutes from './notification.routes.js'
import reportRoutes from './report.routes.js'
import studentRoutes from './student.routes.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.use(categoryRoutes)
router.use(courseRoutes)
router.use(challengeRoutes)
router.use(studentRoutes)
router.use(notificationRoutes)
router.use(reportRoutes)

export default router
