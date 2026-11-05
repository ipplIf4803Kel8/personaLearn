import { useState } from 'react'
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineLockClosed } from 'react-icons/hi2'
import { FormField } from '@/components/pelajar/FormField'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { ProfileLayout } from '@/components/pelajar/ProfileLayout'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

export function PasswordField({ label, value, onChange, error }) {
  const [lihat, setLihat] = useState(false)
  return (
    <FormField label={label} error={error}>
      <span className={cn('flex items-center gap-4 rounded-xl border bg-white px-5', error ? 'border-[#C8303C]' : 'border-[#E6E6EA] focus-within:border-[#5F33E1]')}>
        <HiOutlineLockClosed className="size-6 shrink-0 text-[#8A8A94]" />
        <input
          type={lihat ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          aria-invalid={!!error}
          className="min-w-0 flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-[#A9A9B2]"
        />
        <button type="button" aria-label={lihat ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setLihat((v) => !v)} className="text-[#8A8A94]">
          {lihat ? <HiOutlineEye className="size-6" /> : <HiOutlineEyeSlash className="size-6" />}
        </button>
      </span>
    </FormField>
  )
}

// UC4-L04 Ubah Kata Sandi (kondisi C: tidak valid / lama salah)
export function UbahKataSandiPage() {
  const { navigate } = useRouter()
  const { aksi } = useDb()
  const toast = useToast()
  const [f, setF] = useState({ lama: '', baru: '', konfirmasi: '' })
  const [err, setErr] = useState({})
  const [loading, setLoading] = useState(false)
  async function simpan(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await aksi.ubahKataSandi(f)
      if (!r.ok) return setErr(r.err)
      navigate('/profil/kata-sandi/berhasil', { replace: true })
    } catch {
      toast('Kata sandi gagal disimpan. Coba lagi.', 'gagal')
    } finally {
      setLoading(false)
    }
  }
  return (
    <ProfileLayout kode="UC4-L04">
      <BottomSheet open onClose={() => navigate('/profil', { replace: true })} title="Ubah Kata Sandi">
        <form onSubmit={simpan} noValidate className="space-y-5">
          <PasswordField label="Kata Sandi Lama" value={f.lama} onChange={(v) => setF({ ...f, lama: v })} error={err.lama} />
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
