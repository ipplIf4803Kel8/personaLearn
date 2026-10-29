import { useState } from 'react'
import { motion } from 'motion/react'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { FaGoogle, FaFacebookF, FaApple } from 'react-icons/fa'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { validateLogin, validateRegister } from '@/lib/validators'

const spring = { type: 'spring', stiffness: 300, damping: 30 }

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { ...spring, delay },
})

const socialProviders = [
  { name: 'Google', icon: FaGoogle },
  { name: 'Facebook', icon: FaFacebookF },
  { name: 'Apple', icon: FaApple },
]

const inputClass =
  'h-auto rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 text-base text-slate-700 shadow-none placeholder:text-slate-500 focus-visible:border-[#5F33E1] focus-visible:ring-4 focus-visible:ring-[#5F33E1]/15'

const FieldError = ({ message }) =>
  message && <p className="mt-1.5 px-2 text-sm text-red-600">{message}</p>

export function AuthScreen({
  variant = 'login',
  heading,
  subheading,
  submitLabel,
  switchPromptText,
  switchActionText,
  socialLabel = 'Atau Lanjut Dengan',
  onSubmit,
  onForgotPassword,
  onSwitch,
  onSocialLogin,
}) {
  const isRegister = variant === 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [comingSoon, setComingSoon] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = isRegister ? { name, email, password, confirmPassword } : { email, password }
    const found = (isRegister ? validateRegister : validateLogin)(data)
    setErrors(found)
    if (Object.keys(found).length) return

    setSubmitting(true)
    try {
      await onSubmit({ ...data, email: email.trim() })
    } catch (err) {
      setErrors({ form: err.message })
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      <div className="pointer-events-none absolute -top-10 -left-16 h-56 w-56 rounded-full bg-green-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-violet-200/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-40 -left-10 h-48 w-48 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-56 w-56 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col px-6 py-10">
        <div className="flex flex-1 flex-col justify-center">
          <motion.div {...fadeUp(0)} className="relative text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#5F33E1]">{heading}</h1>
          </motion.div>

          <motion.p
            {...fadeUp(0.1)}
            className={`mt-6 text-center text-xl leading-snug text-[#24252C] ${isRegister ? 'font-medium' : 'font-bold'}`}
          >
            {subheading}
          </motion.p>

          <motion.form {...fadeUp(0.2)} onSubmit={handleSubmit} noValidate className="mt-10 space-y-4">
            {isRegister && (
              <div>
                <Input
                  placeholder="Nama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
                <FieldError message={errors.name} />
              </div>
            )}

            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
              <FieldError message={errors.email} />
            </div>

            <div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
              </button>
            </div>
            <FieldError message={errors.password} />
            </div>

            {isRegister ? (
              <div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Konfirmasi Kata Sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
                <FieldError message={errors.confirmPassword} />
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-base font-semibold text-[#5F33E1]"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
            )}

            {errors.form && (
              <p role="alert" className="text-center text-sm font-medium text-red-600">
                {errors.form}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="h-auto w-full rounded-2xl bg-[#5F33E1] py-4 text-lg font-bold text-white shadow-lg shadow-violet-300/50 hover:bg-[#5F33E1]/90"
            >
              {submitLabel}
            </Button>
          </motion.form>

          <motion.div {...fadeUp(0.3)} className="mt-6 text-center">
            <button type="button" onClick={onSwitch} className="text-base font-semibold text-[#24252C]/80">
              {switchPromptText}{' '}
              {switchActionText && <span className="text-[#5F33E1]">{switchActionText}</span>}
            </button>
          </motion.div>

          <motion.div {...fadeUp(0.4)} className="mt-8">
            <p className="text-center text-base font-bold text-[#5F33E1]">{socialLabel}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {socialProviders.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => (name === 'Google' ? setComingSoon(true) : onSocialLogin?.(name))}
                  aria-label={`Lanjut dengan ${name}`}
                  className="flex h-14 items-center justify-center rounded-2xl bg-slate-50 text-xl text-slate-800 transition-colors hover:bg-slate-100"
                >
                  <Icon />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {comingSoon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setComingSoon(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#24252C]">Segera Hadir</h2>
            <p className="mt-2 text-slate-600">Fitur masuk dengan Google belum tersedia.</p>
            <Button
              onClick={() => setComingSoon(false)}
              className="mt-5 h-auto w-full rounded-2xl bg-[#5F33E1] py-3 font-bold text-white hover:bg-[#5F33E1]/90"
            >
              Mengerti
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function LoginScreen({ onSubmit, onForgotPassword, onSwitchToRegister, onSocialLogin }) {
  return (
    <AuthScreen
      variant="login"
      heading="Masuk"
      subheading={
        <>
          Senang melihat Anda lagi,
          <br />
          Mari lanjutkan belajar!
        </>
      }
      submitLabel="Masuk"
      switchPromptText="Buat Akun Baru"
      onSubmit={onSubmit}
      onForgotPassword={onForgotPassword}
      onSwitch={onSwitchToRegister}
      onSocialLogin={onSocialLogin}
    />
  )
}

export function RegisterScreen({ onSubmit, onSwitchToLogin, onSocialLogin }) {
  return (
    <AuthScreen
      variant="register"
      heading="Buat Akun"
      subheading={
        <>
          Selamat datang di E-Learning,
          <br />
          Mari mulai perjalanan belajar Anda!
        </>
      }
      submitLabel="Buat"
      switchPromptText="Sudah Memiliki Akun"
      onSubmit={onSubmit}
      onSwitch={onSwitchToLogin}
      onSocialLogin={onSocialLogin}
    />
  )
}

export default AuthScreen
