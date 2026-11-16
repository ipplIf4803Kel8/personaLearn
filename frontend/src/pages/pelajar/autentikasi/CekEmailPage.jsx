import { useEffect, useState } from 'react'
import { MdMarkEmailRead } from 'react-icons/md'
import { inputClass, FormField } from '@/components/pelajar/FormField'
import { Screen } from '@/components/pelajar/Screen'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { api } from '@/lib/api'
import { useRouter } from '@/lib/router'

const RESEND_SECONDS = 30

// UC1-L06 Cek Email: pelajar memasukkan kode 6 digit dari email. Kode diperiksa server saat kata sandi baru disimpan.
export function CekEmailPage() {
  const { navigate, query } = useRouter()
  const toast = useToast()
  const email = query.email ?? ''
  const [otp, setOtp] = useState('')
  const [err, setErr] = useState('')
  const [wait, setWait] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  function lanjut(e) {
    e.preventDefault()
    if (!/^\d{6}$/.test(otp)) return setErr('Kode harus 6 digit angka')
    navigate(`/atur-ulang?email=${encodeURIComponent(email)}&otp=${otp}`)
  }

  async function kirimUlang() {
    try {
      await api('/auth/forgot-password', { method: 'POST', body: { email } })
      setWait(RESEND_SECONDS)
      setErr('')
      toast('Kode dikirim ulang.')
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <Screen kode="UC1-L06" back="/masuk">
      <div className="pt-10 text-center">
        <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-violet-100 text-[#5F33E1]">
          <MdMarkEmailRead className="size-14" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-[#24252C] font-['Poppins']">Cek Email Anda</h1>
        <p className="mt-3 text-[#6E6A7C]">
          Jika <strong>{email}</strong> terdaftar, kode 6 digit sudah dikirim. Kode berlaku 10 menit.
        </p>
      </div>
      <form onSubmit={lanjut} noValidate className="mt-8 space-y-4">
        <FormField error={err}>
          <input
            aria-label="Kode 6 digit"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
            aria-invalid={!!err}
          />
        </FormField>
        <Button type="submit" className="w-full">
          Lanjut
        </Button>
        <Button type="button" variant="ghost" className="w-full" disabled={wait > 0} onClick={kirimUlang}>
          {wait > 0 ? `Kirim Ulang (${wait})` : 'Kirim Ulang'}
        </Button>
      </form>
    </Screen>
  )
}
