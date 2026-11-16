import { userProfileService } from '../services/UserProfileService.js'
import { signToken } from '../utils/security.js'
import { handle } from '../utils/httpError.js'

const uid = (req) => req.user.sub

export const getProfile = handle(async (req, res) => {
  res.json({ data: await userProfileService.getProfile(uid(req)), message: 'Profil pengguna' })
})

export const updateProfile = handle(async (req, res) => {
  const data = await userProfileService.updateProfile(uid(req), req.valid.body)
  res.json({ data, message: 'Profil berhasil diperbarui' })
})

export const changePassword = handle(async (req, res) => {
  await userProfileService.changePassword(uid(req), req.valid.body)
  // Token lama dicabut saat sandi berubah; kirim token baru agar sesi ini tetap berjalan.
  const token = signToken({ id: uid(req), role: req.user.role })
  res.json({ data: { token }, message: 'Kata sandi berhasil diubah' })
})

export const uploadAvatar = handle(async (req, res) => {
  const data = await userProfileService.setAvatar(uid(req), req.file?.buffer)
  res.json({ data, message: 'Foto profil berhasil diperbarui' })
})

export const removeAvatar = handle(async (req, res) => {
  res.json({ data: await userProfileService.removeAvatar(uid(req)), message: 'Foto profil dihapus' })
})
