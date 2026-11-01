import { useState } from 'react'
import { inputClass, FormField } from '@/components/pelajar/FormField'
import { Screen } from '@/components/pelajar/Screen'
import { Button } from '@/components/pelajar/Button'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'

// UC1-L05 Lupa Kata Sandi (kondisi C: email belum terdaftar)
export function LupaSandiPage() {
  const { navigate } = useRouter()
  const { aksi } = useDb()
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  async function kirim(e) {
    e.preventDefault()
    setLoading(true)
    const r = await aksi.kirimTautanAturUlang(email.trim())
    setLoading(false)
    if (!r.ok) return setErr(r.pesan)
    navigate(`/cek-email?email=${encodeURIComponent(email.trim())}`, { replace: true })
  }
  return (
    <Screen kode="UC1-L05" back="/masuk" title="">
      <div className="pt-6 text-center">
        <h1 className="text-3xl font-bold text-[#5F33E1] font-['Poppins']">Lupa Kata Sandi</h1>
        <p className="mt-4 text-[#6E6A7C]">Masukkan email akun Anda. Kami akan mengirim tautan untuk mengatur ulang kata sandi.</p>
      </div>
      <form onSubmit={kirim} noValidate className="mt-10 space-y-5">
        <FormField error={err}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} aria-invalid={!!err} />
        </FormField>
        <Button type="submit" className="w-full" loading={loading}>
          Kirim Tautan
        </Button>
      </form>
    </Screen>
  )
}
