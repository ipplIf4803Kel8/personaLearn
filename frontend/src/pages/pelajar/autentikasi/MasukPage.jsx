import { useState } from 'react'
import { LoginScreen } from '@/components/auth/auth-screen'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { getHomePath } from '@/routes/getHomePath'

// UC1-L02 Masuk (kondisi B: login gagal)
export function MasukPage() {
  const { navigate } = useRouter()
  const { aksi } = useDb()
  const [pesan, setPesan] = useState('')
  const [loading, setLoading] = useState(false)
  return (
    <div data-screen="UC1-L02">
      <LoginScreen
        message={pesan}
        loading={loading}
        onSubmit={async ({ email, password }) => {
          setLoading(true)
          const r = await aksi.masuk({ email, kataSandi: password })
          setLoading(false)
          if (!r.ok) return setPesan(r.pesan)
          navigate(getHomePath(r.pengguna), { replace: true })
        }}
        onForgotPassword={() => navigate('/lupa-sandi')}
        onSwitchToRegister={() => navigate('/daftar')}
        onSocialLogin={(p) => navigate(`/otorisasi/${p}`)}
      />
    </div>
  )
}
