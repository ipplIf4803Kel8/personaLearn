import { Router } from 'express'
import { getHealth } from '../controllers/health.controller.js'
import { login, me, register } from '../controllers/auth.controller.js'
import * as admin from '../controllers/admin.controller.js'
import { requireAdmin, requireAuth } from '../middlewares/auth.js'

const router = Router()

router.get('/health', getHealth)

router.post('/auth/register', register)
router.post('/auth/login', login)
router.get('/auth/me', requireAuth, me)

const adminRouter = Router()
adminRouter.use(requireAuth, requireAdmin)

adminRouter.get('/stats', admin.getStats)
adminRouter.get('/reports', admin.getReports)
adminRouter.get('/students', admin.listStudents)
adminRouter.patch('/students/:id/active', admin.setStudentActive)

for (const [path, handlers] of Object.entries({
  categories: admin.categories,
  courses: admin.courses,
  challenges: admin.challenges,
})) {
  adminRouter.get(`/${path}`, handlers.list)
  adminRouter.post(`/${path}`, handlers.create)
  adminRouter.patch(`/${path}/:id`, handlers.update)
  adminRouter.delete(`/${path}/:id`, handlers.remove)
}

adminRouter.get('/courses/:id/lessons', admin.listLessons)
adminRouter.post('/courses/:id/lessons', admin.createLesson)
adminRouter.patch('/courses/:id/lessons/reorder', admin.reorderLessons)
adminRouter.patch('/lessons/:id', admin.lessons.update)
adminRouter.delete('/lessons/:id', admin.lessons.remove)

adminRouter.get('/notifications', admin.notifications.list)
adminRouter.post('/notifications', admin.notifications.create)

router.use('/admin', adminRouter)

export default router
