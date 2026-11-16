import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import LearningPreference from '../models/LearningPreference.js'
import PasswordReset, { MAX_ATTEMPTS } from '../models/PasswordReset.js'
import { hashPassword, verifyPassword, needsRehash, signToken } from '../utils/security.js'
import { sendOtpEmail } from '../utils/mailer.js'

const fail = (status, message, errors) => Object.assign(new Error(message), { status, errors })
// Hash pembanding agar login email tak terdaftar memakan waktu yang mirip.
const DUMMY_HASH = hashPassword('tidak-dipakai-siapapun')
const INVALID_OTP = 'Kode OTP tidak valid atau sudah kedaluwarsa'

export default class AuthService {
  #sendOtp

  constructor({ sendOtp = sendOtpEmail } = {}) {
    this.#sendOtp = sendOtp
  }

  async register({ name, email, password }) {
    if (await User.findByEmail(email)) throw fail(409, 'Email sudah terdaftar', { email: 'Email sudah terdaftar' })
    const user = await User.create({ name, email, passwordHash: hashPassword(password) })
    return { token: signToken(user), user }
  }

  async login({ email, password }) {
    const user = await User.findByEmail(email)
    if (!user) verifyPassword(password, DUMMY_HASH)
    if (!user || !verifyPassword(password, user.passwordHash)) throw fail(401, 'Email atau kata sandi salah')
    if (!user.isActive) throw fail(403, 'Akun dinonaktifkan')
    // Hash scrypt lama diganti ke bcrypt saat login berhasil.
    if (needsRehash(user.passwordHash)) await User.updatePassword(user.id, hashPassword(password), { revoke: false })
    await User.touchLogin(user.id)
    return { token: signToken(user), user }
  }

  async me(id) {
    const user = await User.findById(id)
    if (!user) throw fail(404, 'Pengguna tidak ditemukan')
    return user
  }

  // Selalu selesai tanpa error agar respons tidak membocorkan apakah email terdaftar.
  async forgotPassword(email) {
    const user = await User.findByEmail(email)
    if (!user || !user.isActive) {
      hashPassword('000000') // samakan biaya waktu dengan jalur email terdaftar
      return
    }
    const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
    await PasswordReset.issue(user.id, bcrypt.hashSync(otp, 10))
    // Tanpa await: waktu respons tidak bergantung pada pengiriman email.
    Promise.resolve()
      .then(() => this.#sendOtp(user.email, otp))
      .catch((err) => console.error('Gagal mengirim OTP:', err.message))
  }

  async resetPassword({ email, otp, password }) {
    const user = await User.findByEmail(email)
    const reset = user && (await PasswordReset.findActive(user.id))
    if (!reset || reset.attempts >= MAX_ATTEMPTS) throw fail(400, INVALID_OTP, { otp: INVALID_OTP })
    if (!(await reset.countAttempt())) throw fail(400, INVALID_OTP, { otp: INVALID_OTP })
    if (!bcrypt.compareSync(otp, reset.otpHash)) throw fail(400, INVALID_OTP, { otp: INVALID_OTP })
    if (!(await reset.consume())) throw fail(400, INVALID_OTP, { otp: INVALID_OTP })
    await User.updatePassword(user.id, hashPassword(password))
  }

  getPreferences(userId) {
    return LearningPreference.findByUserId(userId)
  }

  async savePreferences(userId, { mbtiType = null, varkStyle = null }) {
    const pref = await LearningPreference.findByUserId(userId)
    pref.mbtiType = mbtiType
    pref.varkStyle = varkStyle
    return pref.save()
  }
}
