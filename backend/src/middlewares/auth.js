import pool from '../config/db.js'
import { verifyToken } from '../services/auth.service.js'

// Role dan status aktif dibaca dari DB tiap request, jadi akun yang dinonaktifkan
// atau diturunkan rolenya langsung kehilangan akses meski tokennya belum kedaluwarsa.
export async function requireAuth(req, res, next) {
  let payload
  try {
    payload = verifyToken(req.headers.authorization?.replace(/^Bearer /, ''))
  } catch {
    return res.status(401).json({ message: 'Sesi tidak valid, silakan masuk kembali' })
  }
  const { rows } = await pool.query('SELECT id, role, is_active FROM users WHERE id = $1', [payload.sub])
  if (!rows[0]?.is_active) return res.status(401).json({ message: 'Sesi tidak valid, silakan masuk kembali' })
  req.user = { sub: rows[0].id, role: rows[0].role }
  next()
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Akses khusus admin' })
  next()
}

// Pembatas percobaan login (per IP + email), di memori proses.
// ponytail: state hilang saat restart dan tidak dibagi antar-instance; pakai Redis jika backend di-scale.
const attempts = new Map()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10
export function limitLogin(req, res, next) {
  const key = `${req.ip}|${String(req.body?.email ?? '').toLowerCase()}`
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || entry.reset < now) attempts.set(key, { count: 1, reset: now + WINDOW_MS })
  else if (++entry.count > MAX_ATTEMPTS) {
    return res.status(429).json({ message: 'Terlalu banyak percobaan, coba lagi nanti' })
  }
  if (attempts.size > 5000) for (const [k, v] of attempts) if (v.reset < now) attempts.delete(k)
  next()
}
