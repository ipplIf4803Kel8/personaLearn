import { Router } from 'express'
import c from '../../controllers/admin/challenge.controller.js'
import { validate } from '../../middlewares/validate.js'
import { challengeBody, challengePatch, idParams } from '../../validators/admin.validators.js'

const router = Router()

router.get('/challenges', c.list)
router.post('/challenges', validate({ body: challengeBody }), c.create)
router.patch('/challenges/:id', validate({ params: idParams, body: challengePatch }), c.update)
router.delete('/challenges/:id', validate({ params: idParams }), c.delete)

export default router
