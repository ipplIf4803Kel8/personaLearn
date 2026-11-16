import { Router } from 'express'
import * as c from '../controllers/learning.controller.js'
import { requireAuth } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import * as v from '../validators/learning.validators.js'

const router = Router()
router.get('/me/stats', requireAuth, c.getStats)
router.get('/me/enrollments', requireAuth, c.listEnrollments)
router.get('/me/enrollments/:courseId', requireAuth, validate({ params: v.courseIdParams }), c.getEnrollment)

router.get('/lessons/:id', requireAuth, validate({ params: v.idParams }), c.getLesson)
router.post('/lessons/:id/complete', requireAuth, validate({ params: v.idParams, body: v.completeLessonBody }), c.completeLesson)
router.put('/lessons/:id/position', requireAuth, validate({ params: v.idParams, body: v.positionBody }), c.savePosition)
router.put('/lessons/:id/reaction', requireAuth, validate({ params: v.idParams, body: v.reactionBody }), c.setReaction)

router.get('/challenges/active', requireAuth, c.activeChallenges)
router.post('/challenges/:id/complete', requireAuth, validate({ params: v.idParams }), c.completeChallenge)

export default router
