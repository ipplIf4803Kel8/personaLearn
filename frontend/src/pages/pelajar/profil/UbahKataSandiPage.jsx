import { useState } from 'react'
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineLockClosed } from 'react-icons/hi2'
import { FormField } from '@/components/pelajar/FormField'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { ProfileLayout } from '@/components/pelajar/ProfileLayout'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { api, setToken } from '@/lib/api'
import { validateKataSandi } from '@/lib/profilValidation'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

export function PasswordField({ label, value, onChange, error, autoComplete = 'new-password' }) {
  const [lihat, setLihat] = useState(false)
  return (
    <FormField label={label} error={error}>
      <span className={cn('flex items-center gap-4 rounded-xl border bg-white pr-2 pl-5', error ? 'border-[#C8303C]' : 'border-[#E6E6EA] focus-within:border-[#5F33E1]')}>
        <HiOutlineLockClosed className="size-6 shrink-0 text-subtle" />
        <input
          type={lihat ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete={autoComplete}
          aria-invalid={!!error}
          className="min-w-0 flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-subtle"
        />
        <button type="button" aria-label={`${lihat ? 'Sembunyikan' : 'Tampilkan'} ${label.toLowerCase()}`} onClick={() => setLihat((v) => !v)} className="flex size-10 shrink-0 items-center justify-center text-subtle">
          {lihat ? <HiOutlineEye className="size-6" /> : <HiOutlineEyeSlash className="size-6" />}
        </button>
      </span>
    </FormField>
  )
}

// UC4-L04 Ubah Kata Sandi (kondisi C: tidak valid / lama salah)
export function UbahKataSandiPage() {
  const { navigate } = useRouter()
  const toast = useToast()
  const [f, setF] = useState({ lama: '', baru: '', konfirmasi: '' })
  const [err, setErr] = useState({})
  const [loading, setLoading] = useState(false)
  async function simpan(e) {
    e.preventDefault()
    const errors = validateKataSandi(f)
    setErr(errors)
    if (Object.keys(errors).length) return
    setLoading(true)
    try {
      const res = await api('/me/password', { method: 'PUT', body: { oldPassword: f.lama, newPassword: f.baru } })
      // token lama dicabut server saat sandi berubah
      if (res?.data?.token) setToken(res.data.token)
      navigate('/profil/kata-sandi/berhasil', { replace: true })
    } catch (e2) {
      if (e2.errors) setErr({ lama: e2.errors.oldPassword, baru: e2.errors.newPassword })
      else toast('Kata sandi gagal disimpan. Coba lagi.', 'gagal')
    } finally {
      setLoading(false)
    }
  }
  return (
    <ProfileLayout kode="UC4-L04">
      <BottomSheet open onClose={() => navigate('/profil', { replace: true })} title="Ubah Kata Sandi">
        <form onSubmit={simpan} noValidate className="space-y-5">
          <PasswordField label="Kata Sandi Lama" autoComplete="current-password" value={f.lama} onChange={(v) => setF({ ...f, lama: v })} error={err.lama} />
          <PasswordField label="Kata Sandi Baru" value={f.baru} onChange={(v) => setF({ ...f, baru: v })} error={err.baru} />
          <PasswordField label="Konfirmasi Kata Sandi Baru" value={f.konfirmasi} onChange={(v) => setF({ ...f, konfirmasi: v })} error={err.konfirmasi} />
          <Button type="submit" className="w-full" loading={loading}>
            Simpan
          </Button>
        </form>
      </BottomSheet>
    </ProfileLayout>
  )
}
