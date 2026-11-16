import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET belum diisi di backend/.env')

const BCRYPT_COST = 10

// Sinkron supaya seed dan kode lama tetap bisa memakainya. ponytail: memblokir event loop ~60 ms per hash.
export const hashPassword = (password) => bcrypt.hashSync(password, BCRYPT_COST)

// Hash bcrypt diawali "$2"; selain itu dianggap format scrypt lama "salt:hash".
export const needsRehash = (stored) => !stored.startsWith('$2')

export function verifyPassword(password, stored) {
  if (!needsRehash(stored)) return bcrypt.compareSync(password, stored)
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  return crypto.timingSafeEqual(crypto.scryptSync(password, salt, 64), Buffer.from(hash, 'hex'))
}

export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET)
