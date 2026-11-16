import { Router } from 'express'
import * as course from '../controllers/course.controller.js'
import { requireAuth } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { idParams, listQuery, ratingBody, shortListQuery } from '../validators/course.validators.js'

const router = Router()
router.use(['/categories', '/courses'], requireAuth)

router.get('/categories', course.categories)
router.get('/courses', validate({ query: listQuery }), course.list)
// Rute tetap harus sebelum /courses/:id
router.get('/courses/popular', validate({ query: shortListQuery }), course.popular)
router.get('/courses/recommended', validate({ query: shortListQuery }), course.recommended)
router.get('/courses/:id', validate({ params: idParams }), course.detail)
router.get('/courses/:id/preview', validate({ params: idParams }), course.preview)
router.post('/courses/:id/enroll', validate({ params: idParams }), course.enroll)
router.post('/courses/:id/rating', validate({ params: idParams, body: ratingBody }), course.rate)
router.post('/courses/:id/favorite', validate({ params: idParams }), course.addFavorite)
router.delete('/courses/:id/favorite', validate({ params: idParams }), course.removeFavorite)

export default router
