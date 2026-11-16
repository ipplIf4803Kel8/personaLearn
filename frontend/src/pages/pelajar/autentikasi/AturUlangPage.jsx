import { useState } from 'react'
import { MdLockReset } from 'react-icons/md'
import { inputClass, FormField, PasswordInput } from '@/components/pelajar/FormField'
import { Screen } from '@/components/pelajar/Screen'
import { Button } from '@/components/pelajar/Button'
import { api } from '@/lib/api'
import { useRouter } from '@/lib/router'
import { validateRegister } from '@/lib/validators'

// UC1-L07 Atur Ulang Kata Sandi (kondisi D: kata sandi baru tidak valid)
export function AturUlangPage() {
  const { navigate, query } = useRouter()
  const [baru, setBaru] = useState('')
  const [konfirmasi, setKonfirmasi] = useState('')
  const [err, setErr] = useState({})
  const [loading, setLoading] = useState(false)
  async function simpan(e) {
    e.preventDefault()
    const { password, confirmPassword } = validateRegister({ name: '-', email: 'a@a.a', password: baru, confirmPassword: konfirmasi })
    const salah = { baru: password || (baru ? undefined : 'Kata sandi wajib diisi'), konfirmasi: konfirmasi ? confirmPassword : 'Konfirmasi kata sandi wajib diisi' }
    setErr(salah)
    if (salah.baru || salah.konfirmasi) return
    setLoading(true)
    try {
      await api('/auth/reset-password', { method: 'POST', body: { email: query.email ?? '', otp: query.otp ?? '', password: baru } })
      navigate('/atur-ulang/berhasil', { replace: true })
    } catch (e) {
      setLoading(false)
      setErr({ baru: e.errors?.password, kode: e.errors?.otp ?? (e.errors ? undefined : e.message) })
    }
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
        {err.kode && (
          <div role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {err.kode}{' '}
            <button type="button" className="min-h-10 underline" onClick={() => navigate(`/cek-email?email=${encodeURIComponent(query.email ?? '')}`, { replace: true })}>
              Masukkan kode lagi
            </button>
          </div>
        )}
        <FormField error={err.baru}>
          <PasswordInput aria-label="Kata Sandi Baru" label="kata sandi baru" autoComplete="new-password" placeholder="Kata Sandi Baru" value={baru} onChange={(e) => setBaru(e.target.value)} className={inputClass} aria-invalid={!!err.baru} />
        </FormField>
        <FormField error={err.konfirmasi}>
          <PasswordInput aria-label="Konfirmasi Kata Sandi Baru" label="konfirmasi kata sandi baru" autoComplete="new-password" placeholder="Konfirmasi Kata Sandi Baru" value={konfirmasi} onChange={(e) => setKonfirmasi(e.target.value)} className={inputClass} aria-invalid={!!err.konfirmasi} />
        </FormField>
        <Button type="submit" className="w-full" loading={loading}>
          Simpan Kata Sandi
        </Button>
      </form>
    </Screen>
  )
}
