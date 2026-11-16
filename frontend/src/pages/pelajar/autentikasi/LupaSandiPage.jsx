import { useState } from 'react'
import { inputClass, FormField } from '@/components/pelajar/FormField'
import { Screen } from '@/components/pelajar/Screen'
import { Button } from '@/components/pelajar/Button'
import { api } from '@/lib/api'
import { useRouter } from '@/lib/router'
import { validateLoginForm } from '@/lib/formValidation'

// UC1-L05 Lupa Kata Sandi. Server selalu menjawab sama, jadi email tidak terdaftar pun lanjut ke layar kode.
export function LupaSandiPage() {
  const { navigate } = useRouter()
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  async function kirim(e) {
    e.preventDefault()
    const salah = validateLoginForm({ email, password: '-' }).email
    setErr(salah ?? '')
    if (salah) return
    setLoading(true)
    try {
      await api('/auth/forgot-password', { method: 'POST', body: { email: email.trim() } })
      navigate(`/cek-email?email=${encodeURIComponent(email.trim())}`, { replace: true })
    } catch (e) {
      setLoading(false)
      setErr(e.errors?.email ?? e.message)
    }
  }
  return (
    <Screen kode="UC1-L05" back="/masuk" title="">
      <div className="pt-6 text-center">
        <h1 className="text-3xl font-bold text-[#5F33E1] font-['Poppins']">Lupa Kata Sandi</h1>
        <p className="mt-4 text-[#6E6A7C]">Masukkan email akun Anda. Kami akan mengirim kode 6 digit untuk mengatur ulang kata sandi.</p>
      </div>
      <form onSubmit={kirim} noValidate className="mt-10 space-y-5">
        <FormField error={err}>
          <input type="email" inputMode="email" autoComplete="email" aria-label="Email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} aria-invalid={!!err} />
        </FormField>
        <Button type="submit" className="w-full" loading={loading}>
          Kirim Kode
        </Button>
      </form>
    </Screen>
  )
}
