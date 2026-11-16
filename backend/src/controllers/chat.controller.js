import { chatService } from '../services/ChatService.js'

// ChatController: lapisan HTTP tipis; logika ada di ChatService.
export const history = async (req, res) => {
  const { lessonId, limit, before } = req.valid.query
  const data = await chatService.history(req.user.sub, { lessonId, limit, before })
  res.json({ data, message: 'Riwayat obrolan berhasil dimuat' })
}

export const send = async (req, res) => {
  const { content, lessonId } = req.valid.body
  const data = await chatService.send(req.user.sub, { content, lessonId })
  res.status(201).json({ data, message: 'Pesan terkirim' })
}
