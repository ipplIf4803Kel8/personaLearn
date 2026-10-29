import pool from '../config/db.js'
import { hashPassword, verifyPassword, signToken } from '../services/auth.service.js'
import { toCamel } from '../services/crud.service.js'

const fail = (status, message) => Object.assign(new Error(message), { status })
const publicUser = ({ password_hash, ...user }) => toCamel(user)

export async function register(req, res) {
  const { name, email, password, confirmPassword } = req.body
  if (!name?.trim()) throw fail(400, 'Nama wajib diisi')
  if (!/^\S+@\S+\.\S+$/.test(email ?? '')) throw fail(400, 'Email tidak valid')
  if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password ?? '')) {
    throw fail(400, 'Kata sandi minimal 8 karakter dengan huruf dan angka')
  }
  if (confirmPassword !== undefined && confirmPassword !== password) {
    throw fail(400, 'Konfirmasi kata sandi tidak cocok')
  }

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, last_login_at)
     VALUES ($1, $2, $3, NOW()) RETURNING *`,
    [name.trim(), email.trim().toLowerCase(), hashPassword(password)]
  )
  res.status(201).json({ token: signToken(rows[0]), user: publicUser(rows[0]) })
}

export async function login(req, res) {
  const { email, password } = req.body
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [(email ?? '').trim().toLowerCase()])
  const user = rows[0]
  if (!user || !verifyPassword(password ?? '', user.password_hash)) throw fail(401, 'Email atau kata sandi salah')
  if (!user.is_active) throw fail(403, 'Akun dinonaktifkan')

  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id])
  res.json({ token: signToken(user), user: publicUser(user) })
}

export async function me(req, res) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.sub])
  if (!rows[0]) throw fail(404, 'Pengguna tidak ditemukan')
  res.json(publicUser(rows[0]))
}
