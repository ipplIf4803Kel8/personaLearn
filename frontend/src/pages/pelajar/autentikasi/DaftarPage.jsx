import { useState } from 'react'
import { RegisterScreen } from '@/components/auth/auth-screen'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { useAuth } from '@/context/AuthContext'
import { SERVER_MATI } from '@/pages/pelajar/autentikasi/MasukPage'

// UC1-L03 Buat Akun (kondisi A: data tidak valid). Akun dibuat di backend (POST /auth/register);
// kalau server tidak bisa dihubungi, dibuat di data dummy.
export function DaftarPage() {
  const { navigate } = useRouter()
  const { aksi } = useDb()
  const auth = useAuth()
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  return (
    <div data-screen="UC1-L03">
      <RegisterScreen
        errors={errors}
        loading={loading}
        onSubmit={async ({ email, password, confirmPassword }) => {
          setLoading(true)
          setErrors({})
          try {
            // Form Figma tidak punya kolom nama, jadi nama awal diambil dari email (bisa diubah di Profil).
            await auth.register({ name: email.split('@')[0], email, password, confirmPassword })
            auth.logout() // sesudah daftar, pelajar diminta masuk sendiri (UC1-L04)
            setLoading(false)
            return navigate('/daftar/berhasil', { replace: true })
          } catch (err) {
            if (err.message !== SERVER_MATI) {
              setLoading(false)
              const m = err.message
              return setErrors(/konfirmasi/i.test(m) ? { confirmPassword: m } : /sandi/i.test(m) ? { password: m } : { email: m })
            }
          }
          const r = await aksi.daftar({ email, kataSandi: password, konfirmasi: confirmPassword })
          setLoading(false)
          if (!r.ok) return setErrors({ email: r.err.email, password: r.err.kataSandi, confirmPassword: r.err.konfirmasi })
          navigate('/daftar/berhasil', { replace: true })
        }}
        onSwitchToLogin={() => navigate('/masuk')}
        onSocialLogin={(p) => navigate(`/otorisasi/${p}`)}
      />
    </div>
  )
}
