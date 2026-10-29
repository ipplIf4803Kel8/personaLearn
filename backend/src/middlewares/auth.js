import { verifyToken } from '../services/auth.service.js'

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, '')
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    res.status(401).json({ message: 'Sesi tidak valid, silakan masuk kembali' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Akses khusus admin' })
  next()
}
