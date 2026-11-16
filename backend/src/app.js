import path from 'node:path'
import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import { notFound, errorHandler } from './middlewares/errorHandler.js'

const app = express()

app.disable('x-powered-by')
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  next()
})
// CORS_ORIGIN: daftar origin dipisah koma; kosong berarti semua origin diizinkan (dev).
const origins = (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean)
app.use(cors(origins.length ? { origin: origins } : undefined))
app.use(express.json())

app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || 'uploads')))
app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app
