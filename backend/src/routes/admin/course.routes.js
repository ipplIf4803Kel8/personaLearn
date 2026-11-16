import { Router } from 'express'
import c from '../../controllers/admin/course.controller.js'
import { validate } from '../../middlewares/validate.js'
import {
  courseBody,
  coursePatch,
  idParams,
  lessonBody,
  lessonPatch,
  reorderBody,
} from '../../validators/admin.validators.js'

const router = Router()

router.get('/courses', c.list)
router.post('/courses', validate({ body: courseBody }), c.create)
router.patch('/courses/:id', validate({ params: idParams, body: coursePatch }), c.update)
router.delete('/courses/:id', validate({ params: idParams }), c.delete)

router.get('/courses/:id/lessons', validate({ params: idParams }), c.listLessons)
router.post('/courses/:id/lessons', validate({ params: idParams, body: lessonBody }), c.createLesson)
router.patch('/courses/:id/lessons/reorder', validate({ params: idParams, body: reorderBody }), c.reorderLessons)
router.patch('/lessons/:id', validate({ params: idParams, body: lessonPatch }), c.updateLesson)
router.delete('/lessons/:id', validate({ params: idParams }), c.deleteLesson)

export default router
