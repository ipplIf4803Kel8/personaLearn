import { useState } from 'react'
import { RegisterScreen } from '@/components/auth/auth-screen'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'

// UC1-L03 Buat Akun (kondisi A: data tidak valid)
export function DaftarPage() {
  const { navigate } = useRouter()
  const { aksi } = useDb()
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  return (
    <div data-screen="UC1-L03">
      <RegisterScreen
        errors={errors}
        loading={loading}
        onSubmit={async ({ email, password, confirmPassword }) => {
          setLoading(true)
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
