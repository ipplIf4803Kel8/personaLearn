import { validateLogin, validateRegister } from '@/lib/validators'

// Pemeriksaan form Masuk & Buat Akun sebelum dikirim ke server.
// Aturannya dari lib/validators.js (buatan tim), ditambah pesan "wajib diisi" untuk kolom kosong.
// Hasil: { email?, password?, confirmPassword? } -> pesan ditampilkan di bawah kolomnya.

export function validateLoginForm({ email, password }) {
  const errors = validateLogin({ email, password })
  if (!email.trim()) errors.email = 'Email wajib diisi'
  return errors
}

export function validateRegisterForm({ email, password, confirmPassword }) {
  // Form Figma tidak punya kolom nama, jadi aturan nama dilewati.
  const { name: _abaikan, ...errors } = validateRegister({ name: '-', email, password, confirmPassword })
  if (!email.trim()) errors.email = 'Email wajib diisi'
  if (!password) errors.password = 'Kata sandi wajib diisi'
  if (!confirmPassword) errors.confirmPassword = 'Konfirmasi kata sandi wajib diisi'
  return errors
}
