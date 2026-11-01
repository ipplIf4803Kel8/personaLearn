import { useState } from 'react'
import { motion } from 'motion/react'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { FaGoogle, FaFacebookF, FaApple } from 'react-icons/fa'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
  'h-auto rounded-xl border-2 border-transparent bg-[#F1F4FF] px-5 py-4 text-base text-[#24252C] shadow-none placeholder:text-[#626262] focus-visible:border-[#1F41BB] focus-visible:bg-white focus-visible:ring-0 aria-[invalid=true]:border-[#C8303C]'

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
  errors = {},
  message,
  loading = false,
}) {
  const isRegister = variant === 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(isRegister ? { email, password, confirmPassword } : { email, password })
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white font-['DM_Sans',ui-sans-serif]">
      <div className="pointer-events-none absolute -top-10 -left-16 h-56 w-56 rounded-full bg-green-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-violet-200/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-40 -left-10 h-48 w-48 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-56 w-56 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col px-6 py-10">
        <div className="flex flex-1 flex-col justify-center">
          <motion.div {...fadeUp(0)} className="relative text-center">
            <h1 className="font-['Poppins'] text-[2rem] font-bold text-[#5F33E1]">{heading}</h1>
          </motion.div>

          <motion.p
            {...fadeUp(0.1)}
            className={`mt-6 text-center font-['Poppins'] leading-snug text-black ${isRegister ? 'text-sm font-medium' : 'text-xl font-semibold'}`}
          >
            {subheading}
          </motion.p>

          <motion.form {...fadeUp(0.2)} onSubmit={handleSubmit} noValidate className="mt-10 space-y-4">
            {message && (
              <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {message}
              </p>
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              aria-invalid={!!errors.email}
              required
            />
            <FieldError text={errors.email} />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
                aria-invalid={!!errors.password}
                required
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
            <FieldError text={errors.password} />

            {isRegister ? (
              <>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Konfirmasi Kata Sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  aria-invalid={!!errors.confirmPassword}
                  required
                />
                <FieldError text={errors.confirmPassword} />
              </>
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="font-['Poppins'] text-sm font-semibold text-[#5F33E1]"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-auto w-full rounded-xl bg-[#5F33E1] py-4 font-['Poppins'] text-xl font-semibold text-white shadow-[0_10px_20px_rgba(95,51,225,0.3)] hover:bg-[#5F33E1]/90"
            >
              {loading ? 'Memproses...' : submitLabel}
            </Button>
          </motion.form>

          <motion.div {...fadeUp(0.3)} className="mt-6 text-center">
            <button type="button" onClick={onSwitch} className="font-['Poppins'] text-sm font-semibold text-[#494949]">
              {switchPromptText}{' '}
              {switchActionText && <span className="text-[#5F33E1]">{switchActionText}</span>}
            </button>
          </motion.div>

          <motion.div {...fadeUp(0.4)} className="mt-8">
            <p className="text-center font-['Poppins'] text-sm font-semibold text-[#5F33E1]">{socialLabel}</p>
            <div className="mt-4 flex justify-center gap-3">
              {socialProviders.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onSocialLogin?.(name)}
                  aria-label={`Lanjut dengan ${name}`}
                  className="flex h-11 w-[60px] items-center justify-center rounded-xl bg-[#ECECEC] text-xl text-black transition-colors hover:bg-[#E2E2E2]"
                >
                  <Icon />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function FieldError({ text }) {
  if (!text) return null
  return (
    <p role="alert" className="-mt-2 px-2 text-sm font-medium text-rose-600">
      {text}
    </p>
  )
}

export function LoginScreen({ onSubmit, onForgotPassword, onSwitchToRegister, onSocialLogin, ...rest }) {
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
      {...rest}
    />
  )
}

export function RegisterScreen({ onSubmit, onSwitchToLogin, onSocialLogin, ...rest }) {
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
      {...rest}
    />
  )
}

export default AuthScreen
