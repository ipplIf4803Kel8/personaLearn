const EMAIL = /^\S+@\S+\.\S+$/
const PHONE = /^\+?[0-9][0-9 -]{7,18}$/
const PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export const FOTO_TIPE = ['image/jpeg', 'image/png', 'image/webp']
export const FOTO_MAKS = 2 * 1024 * 1024

export function validateProfil({ nama, email, telepon }) {
  const errors = {}
  if (!nama.trim()) errors.nama = 'Nama wajib diisi'
  else if (nama.trim().length > 100) errors.nama = 'Nama maksimal 100 karakter'
  if (!email.trim()) errors.email = 'Email wajib diisi'
  else if (!EMAIL.test(email.trim())) errors.email = 'Email tidak valid'
  if (telepon.trim() && !PHONE.test(telepon.trim())) errors.telepon = 'Nomor telepon tidak valid'
  return errors
}

export function validateKataSandi({ lama, baru, konfirmasi }) {
  const errors = {}
  if (!lama) errors.lama = 'Kata sandi lama wajib diisi'
  if (!baru) errors.baru = 'Kata sandi baru wajib diisi'
  else if (!PASSWORD.test(baru)) errors.baru = 'Minimal 8 karakter dengan huruf dan angka'
  else if (baru === lama) errors.baru = 'Kata sandi baru harus berbeda dari yang lama'
  if (!konfirmasi) errors.konfirmasi = 'Konfirmasi kata sandi wajib diisi'
  else if (konfirmasi !== baru) errors.konfirmasi = 'Konfirmasi kata sandi tidak cocok'
  return errors
}

// Mengenali format dari byte awal berkas (bukan dari type/ekstensi): JPEG, PNG, atau WebP.
export function formatFoto(b) {
  const sama = (mulai, arr) => arr.every((v, i) => b[mulai + i] === v)
  if (sama(0, [0xff, 0xd8, 0xff])) return 'jpeg'
  if (sama(0, [0x89, 0x50, 0x4e, 0x47])) return 'png'
  if (sama(0, [0x52, 0x49, 0x46, 0x46]) && sama(8, [0x57, 0x45, 0x42, 0x50])) return 'webp'
  return null
}

export async function validateFoto(file) {
  if (file.size > FOTO_MAKS) return 'Ukuran foto maksimal 2 MB'
  const salah = 'Foto harus berformat JPG, PNG, atau WebP'
  if (file.type && !FOTO_TIPE.includes(file.type)) return salah
  try {
    const awal = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    return formatFoto(awal) ? '' : salah
  } catch {
    return 'Foto tidak bisa dibaca. Pilih foto lain.'
  }
}
