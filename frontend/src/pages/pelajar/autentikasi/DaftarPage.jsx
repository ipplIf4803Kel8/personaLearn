import { useState } from 'react'
import { RegisterScreen } from '@/components/auth/auth-screen'
import { api } from '@/lib/api'
import { useRouter } from '@/lib/router'
import { validateRegisterForm } from '@/lib/formValidation'

// UC1-L03 Buat Akun (kondisi A: data tidak valid). Akun dibuat lewat POST /auth/register,
// lalu pelajar diminta masuk sendiri (UC1-L04).
export function DaftarPage() {
  const { navigate } = useRouter()
  const [errors, setErrors] = useState({})
  const [pesan, setPesan] = useState('')
  const [loading, setLoading] = useState(false)
  return (
    <div data-screen="UC1-L03">
      <RegisterScreen
        errors={errors}
        message={pesan}
        loading={loading}
        onSubmit={async (form) => {
          setPesan('')
          const salah = validateRegisterForm(form)
          setErrors(salah)
          if (Object.keys(salah).length) return
          setLoading(true)
          try {
            await api('/auth/register', { method: 'POST', body: { ...form, name: form.name.trim(), email: form.email.trim() } })
            navigate('/daftar/berhasil', { replace: true })
          } catch (err) {
            setLoading(false)
            setErrors(err.errors ?? {})
            setPesan(err.errors ? '' : err.message)
          }
        }}
        onSwitchToLogin={() => navigate('/masuk')}
        onSocialLogin={(p) => navigate(`/otorisasi/${p}`)}
      />
    </div>
  )
}
