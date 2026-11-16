import { useState } from 'react'
import { LoginScreen } from '@/components/auth/auth-screen'
import { useRouter } from '@/lib/router'
import { useAuth } from '@/context/AuthContext'
import { validateLoginForm } from '@/lib/formValidation'

// UC1-L02 Masuk (kondisi B: login gagal). Pelajar dan admin masuk lewat POST /auth/login.
export function MasukPage() {
  const { navigate } = useRouter()
  const auth = useAuth()
  const [pesan, setPesan] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  return (
    <div data-screen="UC1-L02">
      <LoginScreen
        message={pesan}
        errors={errors}
        loading={loading}
        onSubmit={async ({ email, password }) => {
          setPesan('')
          const salah = validateLoginForm({ email, password })
          setErrors(salah)
          if (Object.keys(salah).length) return
          setLoading(true)
          try {
            await auth.login({ email, password }) // GuestOnly yang mengalihkan ke beranda
          } catch (err) {
            setLoading(false)
            setErrors(err.errors ?? {})
            setPesan(err.errors ? '' : err.message) // mis. "Email atau kata sandi salah", "Akun dinonaktifkan"
          }
        }}
        onForgotPassword={() => navigate('/lupa-sandi')}
        onSwitchToRegister={() => navigate('/daftar')}
        onSocialLogin={(p) => navigate(`/otorisasi/${p}`)}
      />
    </div>
  )
}
