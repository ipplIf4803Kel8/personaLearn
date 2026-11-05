import { useState } from 'react'
import { LoginScreen } from '@/components/auth/auth-screen'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { getHomePath } from '@/routes/getHomePath'
import { useAuth } from '@/context/AuthContext'
import { validateLoginForm } from '@/lib/formValidation'

export const SERVER_MATI = 'Tidak dapat terhubung ke server' // pesan dari lib/api.js

// UC1-L02 Masuk (kondisi B: login gagal). Pelajar dan admin login ke backend (context/AuthContext).
// Kalau server tidak bisa dihubungi, pelajar masih bisa masuk dengan data dummy (mode uji tanpa backend).
export function MasukPage() {
  const { navigate } = useRouter()
  const { aksi } = useDb()
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
          // Periksa isian dulu (email kosong/tidak valid, sandi kosong) sebelum dikirim ke server.
          const salah = validateLoginForm({ email, password })
          setErrors(salah)
          if (Object.keys(salah).length) return
          setLoading(true)
          try {
            const user = await auth.login({ email, password })
            if (user.role === 'admin') return navigate('/admin', { replace: true })
            const profil = aksi.masukDariServer(user)
            return navigate(getHomePath(profil), { replace: true })
          } catch (err) {
            if (err.message !== SERVER_MATI) {
              setLoading(false)
              return setPesan(err.message) // mis. "Email atau kata sandi salah", "Akun dinonaktifkan"
            }
          }
          // Server mati: coba data dummy (data/db.jsx).
          const r = await aksi.masuk({ email, kataSandi: password })
          setLoading(false)
          if (!r.ok) return setPesan(r.pesan)
          if (r.pengguna.peran === 'admin') {
            aksi.keluar()
            return setPesan('Akun admin harus terdaftar di server. Pastikan backend berjalan.')
          }
          navigate(getHomePath(r.pengguna), { replace: true })
        }}
        onForgotPassword={() => navigate('/lupa-sandi')}
        onSwitchToRegister={() => navigate('/daftar')}
        onSocialLogin={(p) => navigate(`/otorisasi/${p}`)}
      />
    </div>
  )
}
