const EMAIL = /^\S+@\S+\.\S+$/
const PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export function validateLogin({ email, password }) {
  const errors = {}
  if (!EMAIL.test(email.trim())) errors.email = 'Email tidak valid'
  if (!password) errors.password = 'Kata sandi wajib diisi'
  return errors
}

export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Nama wajib diisi'
  if (!EMAIL.test(email.trim())) errors.email = 'Email tidak valid'
  if (!PASSWORD.test(password)) errors.password = 'Minimal 8 karakter dengan huruf dan angka'
  if (confirmPassword !== password) errors.confirmPassword = 'Konfirmasi kata sandi tidak cocok'
  return errors
}
