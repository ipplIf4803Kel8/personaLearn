import { useCallback, useEffect, useState } from 'react'
import { MdNotificationsNone, MdNotificationsOff } from 'react-icons/md'
import { inputClass, FormField } from '@/components/pelajar/FormField'
import { Screen } from '@/components/pelajar/Screen'
import { ErrorState } from '@/components/pelajar/DataState'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { api } from '@/lib/api'
import { useRouter } from '@/lib/router'

const FREKUENSI = [['harian', 'Harian'], ['mingguan', 'Mingguan']]
const JENIS = [['allowChallenge', 'Tantangan mingguan'], ['allowPromo', 'Promo & diskon']]

// UC5-L02 Pengaturan Notifikasi (kondisi C: gagal disimpan)
export function PengaturanNotifikasiPage() {
  const { navigate } = useRouter()
  const toast = useToast()
  const [p, setP] = useState(null)
  const [gagalMuat, setGagalMuat] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const muat = useCallback(() => {
    setGagalMuat(false)
    api('/me/notification-settings').then((res) => setP(res.data)).catch(() => setGagalMuat(true))
  }, [])
  useEffect(muat, [muat])

  async function simpan() {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.reminderTime)) return setErr('Waktu pengingat wajib diisi')
    setErr('')
    setLoading(true)
    try {
      await api('/me/notification-settings', { method: 'PUT', body: p })
      navigate('/notifikasi/pengaturan/berhasil', { replace: true })
    } catch {
      toast('Pengaturan gagal disimpan. Coba lagi.', 'gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen kode="UC5-L02" back="/notifikasi" title="Pengaturan Notifikasi">
      {gagalMuat ? (
        <ErrorState title="Pengaturan gagal dimuat" onRetry={muat} />
      ) : !p ? (
        <div className="space-y-4" aria-busy="true" aria-label="Memuat pengaturan">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#F3F0FB]" />)}
        </div>
      ) : (
        <>
          <label className="flex items-center justify-between rounded-2xl border border-[#E6E6EA] bg-white p-4">
            <span className="flex items-center gap-3 text-base font-medium text-[#24252C]">
              {p.reminderEnabled ? <MdNotificationsNone className="size-6 text-[#5F33E1]" /> : <MdNotificationsOff className="size-6 text-slate-400" />}
              Pengingat belajar
            </span>
            <input type="checkbox" role="switch" checked={p.reminderEnabled} onChange={(e) => setP({ ...p, reminderEnabled: e.target.checked })} className="peer sr-only" />
            <span className="relative h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-[#5F33E1] after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
          </label>

          <fieldset disabled={!p.reminderEnabled} className="mt-5 disabled:opacity-50">
            <p className="mb-3 text-base font-medium text-[#24252C]">Jadwal Pengingat</p>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Waktu" error={err}>
                <input type="time" value={p.reminderTime} onChange={(e) => setP({ ...p, reminderTime: e.target.value })} className={inputClass} aria-invalid={!!err} />
              </FormField>
              <FormField label="Frekuensi">
                <select value={p.frequency} onChange={(e) => setP({ ...p, frequency: e.target.value })} className={inputClass}>
                  {FREKUENSI.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </FormField>
            </div>
          </fieldset>

          <div className="mt-5">
            <p className="mb-3 text-base font-medium text-[#24252C]">Jenis Notifikasi</p>
            <div className="space-y-2">
              {JENIS.map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-xl border border-[#E6E6EA] bg-white px-4 py-3">
                  <input type="checkbox" className="size-5 accent-[#5F33E1]" checked={p[key]} onChange={(e) => setP({ ...p, [key]: e.target.checked })} />
                  <span className="text-sm text-[#24252C]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button className="mt-8 w-full" loading={loading} onClick={simpan}>
            Simpan Pengaturan
          </Button>
        </>
      )}
    </Screen>
  )
}
