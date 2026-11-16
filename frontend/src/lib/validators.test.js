import { describe, expect, it } from 'vitest'
import { isHttpUrl, validateLogin, validateRegister } from '@/lib/validators'
import { validateLoginForm, validateRegisterForm } from '@/lib/formValidation'
import { validateProfil } from '@/lib/profilValidation'

const valid = { name: 'Budi', email: 'budi@mail.com', password: 'rahasia123', confirmPassword: 'rahasia123' }

describe('validateLogin', () => {
  it('menerima email dan kata sandi yang benar', () => {
    expect(validateLogin({ email: 'a@b.co', password: 'x' })).toEqual({})
  })
  it('menolak email salah dan kata sandi kosong', () => {
    expect(validateLogin({ email: 'bukan-email', password: '' })).toEqual({
      email: 'Email tidak valid',
      password: 'Kata sandi wajib diisi',
    })
  })
})

describe('validateRegister', () => {
  it('menerima data valid', () => {
    expect(validateRegister(valid)).toEqual({})
  })
  it('kata sandi minimal 8 karakter dengan huruf dan angka', () => {
    for (const password of ['abc123', 'abcdefgh', '12345678']) {
      expect(validateRegister({ ...valid, password, confirmPassword: password }).password).toBeDefined()
    }
  })
  it('konfirmasi harus sama', () => {
    expect(validateRegister({ ...valid, confirmPassword: 'lain12345' }).confirmPassword).toBeDefined()
  })
})

describe('formValidation', () => {
  it('menandai kolom kosong sebagai wajib diisi', () => {
    expect(validateLoginForm({ email: '', password: '' })).toMatchObject({ email: 'Email wajib diisi' })
    const e = validateRegisterForm({ name: '', email: '', password: '', confirmPassword: '' })
    expect(e.email).toBe('Email wajib diisi')
    expect(e.password).toBe('Kata sandi wajib diisi')
    expect(e.confirmPassword).toBe('Konfirmasi kata sandi wajib diisi')
  })
  it('membatasi nama 100 karakter', () => {
    expect(validateRegisterForm({ ...valid, name: 'a'.repeat(101) }).name).toBe('Nama maksimal 100 karakter')
  })
  it('lolos untuk data valid', () => {
    expect(validateRegisterForm(valid)).toEqual({})
  })
})

describe('validateProfil telepon', () => {
  const dasar = { nama: 'Budi', email: 'budi@mail.com' }
  it('telepon boleh kosong', () => {
    expect(validateProfil({ ...dasar, telepon: '' })).toEqual({})
  })
  it('menolak telepon tidak valid', () => {
    expect(validateProfil({ ...dasar, telepon: 'abc' }).telepon).toBeDefined()
    expect(validateProfil({ ...dasar, telepon: '+62 812 3456 7890' })).toEqual({})
  })
})

describe('isHttpUrl', () => {
  it('hanya http dan https', () => {
    expect(isHttpUrl('https://contoh.id/v.mp4')).toBe(true)
    expect(isHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpUrl('data:text/html,x')).toBe(false)
    expect(isHttpUrl('')).toBe(false)
  })
})
