import { useState } from 'react'
import { LoginScreen } from '@/components/auth/auth-screen'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { getHomePath } from '@/routes/getHomePath'
import { useAuth } from '@/context/AuthContext'

// UC1-L02 Masuk (kondisi B: login gagal). Dipakai pelajar DAN admin (admin dicek ke backend).
export function MasukPage() {
  const { navigate } = useRouter()
  const { aksi } = useDb()
  const auth = useAuth()
  const [pesan, setPesan] = useState('')
  const [loading, setLoading] = useState(false)
  return (
    <div data-screen="UC1-L02">
      <LoginScreen
        message={pesan}
        loading={loading}
        onSubmit={async ({ email, password }) => {
          setLoading(true)
          setPesan('')
          // 1. Cek ke backend dulu: akun admin login lewat server (lihat context/AuthContext).
          try {
            const user = await auth.login({ email, password })
            if (user.role === 'admin') return navigate('/admin', { replace: true })
            auth.logout() // akun pelajar: sementara halaman pelajar masih memakai data dummy
          } catch {
            // email/sandi tidak ada di server, atau server mati -> lanjut ke data dummy
          }
          // 2. Pelajar: masih data dummy (data/db.jsx) sampai endpoint pelajar di backend siap.
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
