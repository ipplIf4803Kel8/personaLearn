import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET belum diisi di backend/.env')

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  const candidate = crypto.scryptSync(password, salt, 64)
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, 'hex'))
}

export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET)
