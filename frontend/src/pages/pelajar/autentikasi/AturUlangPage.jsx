import { useState } from 'react'
import { MdLockReset } from 'react-icons/md'
import { inputClass, FormField } from '@/components/pelajar/FormField'
import { Screen } from '@/components/pelajar/Screen'
import { Button } from '@/components/pelajar/Button'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'

// UC1-L07 Atur Ulang Kata Sandi (kondisi D: kata sandi baru tidak valid)
export function AturUlangPage() {
  const { navigate, query } = useRouter()
  const { aksi } = useDb()
  const [baru, setBaru] = useState('')
  const [konfirmasi, setKonfirmasi] = useState('')
  const [err, setErr] = useState({})
  const [loading, setLoading] = useState(false)
  async function simpan(e) {
    e.preventDefault()
    setLoading(true)
    const r = await aksi.aturUlangKataSandi(query.email ?? '', baru, konfirmasi)
    setLoading(false)
    if (!r.ok) return setErr(r.err)
    navigate('/atur-ulang/berhasil', { replace: true })
  }
  return (
    <Screen kode="UC1-L07" back="/masuk">
      <div className="pt-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-violet-100 text-[#5F33E1]">
          <MdLockReset className="size-9" />
        </div>
        <h1 className="mt-5 text-3xl font-bold text-[#5F33E1] font-['Poppins']">Atur Ulang Kata Sandi</h1>
        <p className="mt-3 text-[#6E6A7C]">Buat kata sandi baru minimal 8 karakter, kombinasi huruf dan angka.</p>
      </div>
      <form onSubmit={simpan} noValidate className="mt-8 space-y-4">
        <FormField error={err.baru}>
          <input type="password" placeholder="Kata Sandi Baru" value={baru} onChange={(e) => setBaru(e.target.value)} className={inputClass} aria-invalid={!!err.baru} />
        </FormField>
        <FormField error={err.konfirmasi}>
          <input type="password" placeholder="Konfirmasi Kata Sandi Baru" value={konfirmasi} onChange={(e) => setKonfirmasi(e.target.value)} className={inputClass} aria-invalid={!!err.konfirmasi} />
        </FormField>
        <Button type="submit" className="w-full" loading={loading}>
          Simpan Kata Sandi
        </Button>
      </form>
    </Screen>
  )
}
