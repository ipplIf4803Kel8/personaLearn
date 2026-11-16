import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { UserProfile } from '../models/UserProfile.js'
import { hashPassword, verifyPassword } from '../utils/security.js'
import { HttpError } from '../utils/httpError.js'

export const uploadDir = () => path.resolve(process.env.UPLOAD_DIR || 'uploads')

// Jenis file dikenali dari byte awal, bukan dari header yang dikirim klien
const detectImageExt = (buf) => {
  if (buf.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'jpg'
  if (buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return 'png'
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return 'webp'
  return null
}

export class UserProfileService {
  async getProfile(userId) {
    const profile = await UserProfile.findById(userId)
    if (!profile) throw new HttpError(404, 'Pengguna tidak ditemukan')
    return profile
  }

  async updateProfile(userId, { name, email, phone }) {
    const profile = await this.getProfile(userId)
    profile.name = name
    profile.email = email
    profile.phone = phone
    try {
      await profile.save()
    } catch (err) {
      if (err.code === '23505') throw new HttpError(409, 'Email sudah digunakan', { email: 'Email sudah digunakan' })
      throw err
    }
    return profile
  }

  async changePassword(userId, { oldPassword, newPassword }) {
    const stored = await UserProfile.getPasswordHash(userId)
    if (!stored || !(await verifyPassword(oldPassword, stored))) {
      throw new HttpError(422, 'Kata sandi lama salah', { oldPassword: 'Kata sandi lama salah' })
    }
    await UserProfile.setPasswordHash(userId, await hashPassword(newPassword))
  }

  async setAvatar(userId, buffer) {
    const ext = buffer && detectImageExt(buffer)
    if (!ext) throw new HttpError(422, 'Foto harus berformat JPG, PNG, atau WebP', { avatar: 'Foto harus berformat JPG, PNG, atau WebP' })
    const profile = await this.getProfile(userId)
    const filename = `${crypto.randomUUID()}.${ext}`
    await fs.mkdir(uploadDir(), { recursive: true })
    await fs.writeFile(path.join(uploadDir(), filename), buffer)
    await UserProfile.setAvatar(userId, `/uploads/${filename}`)
    await this.#deleteFile(profile.avatarUrl)
    return this.getProfile(userId)
  }

  async removeAvatar(userId) {
    const profile = await this.getProfile(userId)
    await UserProfile.setAvatar(userId, null)
    await this.#deleteFile(profile.avatarUrl)
    return this.getProfile(userId)
  }

  // Hanya file yang kita simpan sendiri (diawali /uploads/) yang dihapus dari disk
  async #deleteFile(url) {
    if (url?.startsWith('/uploads/')) await fs.rm(path.join(uploadDir(), path.basename(url)), { force: true })
  }
}

export const userProfileService = new UserProfileService()
