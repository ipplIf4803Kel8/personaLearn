import pool from '../config/db.js'
import { verifyToken } from '../utils/security.js'

// Role dan status aktif dibaca dari DB tiap request, jadi akun yang dinonaktifkan
// atau diturunkan rolenya langsung kehilangan akses meski tokennya belum kedaluwarsa.
export async function requireAuth(req, res, next) {
  let payload
  try {
    payload = verifyToken(req.headers.authorization?.replace(/^Bearer /, ''))
  } catch {
    return res.status(401).json({ message: 'Sesi tidak valid, silakan masuk kembali' })
  }
  const { rows } = await pool.query('SELECT id, role, is_active, FLOOR(EXTRACT(EPOCH FROM password_changed_at))::float8 AS pwd_changed FROM users WHERE id = $1', [payload.sub])
  if (!rows[0]?.is_active) return res.status(401).json({ message: 'Sesi tidak valid, silakan masuk kembali' })
  // Token yang terbit sebelum kata sandi terakhir diganti dicabut.
  if (rows[0].pwd_changed !== null && payload.iat < rows[0].pwd_changed) {
    return res.status(401).json({ message: 'Sesi tidak valid, silakan masuk kembali' })
  }
  req.user = { sub: rows[0].id, role: rows[0].role }
  next()
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Akses khusus admin' })
  next()
}

// Pembatas percobaan per IP + email, di memori proses. Tiap pembatas punya Map sendiri,
// jadi percobaan login tidak mengurangi jatah lupa kata sandi dan sebaliknya.
// ponytail: state hilang saat restart dan tidak dibagi antar-instance; pakai Redis jika backend di-scale.
const WINDOW_MS = 15 * 60 * 1000

// resetOnSuccess: respons 2xx menghapus hitungan, jadi hanya percobaan gagal yang menumpuk.
function createLimiter(max, { windowMs = WINDOW_MS, resetOnSuccess = false } = {}) {
  const attempts = new Map()
  return (req, res, next) => {
    const key = `${req.ip}|${String(req.body?.email ?? '').trim().toLowerCase()}`
    if (resetOnSuccess) res.on('finish', () => res.statusCode < 300 && attempts.delete(key))
    const now = Date.now()
    const entry = attempts.get(key)
    if (!entry || entry.reset < now) attempts.set(key, { count: 1, reset: now + windowMs })
    else if (++entry.count > max) {
      return res.status(429).json({ message: 'Terlalu banyak percobaan, coba lagi nanti' })
    }
    if (attempts.size > 5000) for (const [k, v] of attempts) if (v.reset < now) attempts.delete(k)
    next()
  }
}

export const limitLogin = createLimiter(10, { resetOnSuccess: true })
export const limitForgotPassword = createLimiter(5)
export const limitResetPassword = createLimiter(10)
