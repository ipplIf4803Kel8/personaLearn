import { Router } from 'express'
import * as chat from '../controllers/chat.controller.js'
import { requireAuth } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { listMessagesQuery, sendMessageBody } from '../validators/chat.validators.js'

const router = Router()

router.get('/chat/messages', requireAuth, validate({ query: listMessagesQuery }), chat.history)
router.post('/chat/messages', requireAuth, validate({ body: sendMessageBody }), chat.send)

export default router
