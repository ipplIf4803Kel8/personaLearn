import AuthService from '../services/AuthService.js'

// Error service yang membawa `errors` per kolom dikirim langsung; sisanya ke errorHandler.
const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res)
  } catch (err) {
    if (err.status && err.errors) return res.status(err.status).json({ message: err.message, errors: err.errors })
    next(err)
  }
}

export class AuthController {
  #service

  constructor(service) {
    this.#service = service
  }

  // Bentuk respons register/login/me ({ token, user }) dipertahankan karena dipakai frontend.
  register = handle(async (req, res) => {
    res.status(201).json(await this.#service.register(req.valid.body))
  })

  login = handle(async (req, res) => {
    res.json(await this.#service.login(req.valid.body))
  })

  me = handle(async (req, res) => {
    res.json(await this.#service.me(req.user.sub))
  })

  forgotPassword = handle(async (req, res) => {
    await this.#service.forgotPassword(req.valid.body.email)
    res.json({ data: null, message: 'Jika email terdaftar, kode OTP sudah dikirim' })
  })

  resetPassword = handle(async (req, res) => {
    await this.#service.resetPassword(req.valid.body)
    res.json({ data: null, message: 'Kata sandi berhasil diubah' })
  })

  getPreferences = handle(async (req, res) => {
    res.json({ data: await this.#service.getPreferences(req.user.sub), message: 'Preferensi belajar' })
  })

  savePreferences = handle(async (req, res) => {
    const data = await this.#service.savePreferences(req.user.sub, req.valid.body)
    res.json({ data, message: 'Preferensi belajar disimpan' })
  })
}

export default new AuthController(new AuthService())
