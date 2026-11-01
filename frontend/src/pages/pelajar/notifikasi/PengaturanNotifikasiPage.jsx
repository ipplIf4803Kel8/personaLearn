import { useState } from 'react'
import { MdNotificationsNone, MdNotificationsOff } from 'react-icons/md'
import { inputClass, FormField } from '@/components/pelajar/FormField'
import { Screen } from '@/components/pelajar/Screen'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'

export const JENIS_NOTIFIKASI = ['Pengingat belajar', 'Tantangan mingguan', 'Rekomendasi AI', 'Promo & diskon']

export const FREKUENSI = ['Harian', 'Mingguan', 'Akhir pekan']

// UC5-L02 Pengaturan Notifikasi (kondisi C: gagal disimpan)
export function PengaturanNotifikasiPage() {
  const { navigate } = useRouter()
  const { db, aksi } = useDb()
  const toast = useToast()
  const id = db.sesi?.idPengguna
  const awal = db.pengaturanNotifikasi.find((p) => p.idPengguna === id) ?? { aktif: true, jenis: [...JENIS_NOTIFIKASI.slice(0, 3)], waktuPengingat: '19:00', frekuensi: 'Harian' }
  const [p, setP] = useState(awal)
  const [loading, setLoading] = useState(false)
  async function simpan() {
    setLoading(true)
    try {
      await aksi.simpanPengaturanNotifikasi(p)
      navigate('/notifikasi/pengaturan/berhasil', { replace: true })
    } catch {
      setP(awal)
      toast('Pengaturan gagal disimpan. Notifikasi dikembalikan ke pengaturan awal.', 'gagal')
    } finally {
      setLoading(false)
    }
  }
  return (
    <Screen kode="UC5-L02" back="/notifikasi" title="Pengaturan Notifikasi">
      <label className="flex items-center justify-between rounded-2xl border border-[#E6E6EA] bg-white p-4">
        <span className="flex items-center gap-3 text-base font-medium text-[#24252C]">
          {p.aktif ? <MdNotificationsNone className="size-6 text-[#5F33E1]" /> : <MdNotificationsOff className="size-6 text-slate-400" />}
          Aktifkan Notifikasi
        </span>
        <input type="checkbox" role="switch" checked={p.aktif} onChange={(e) => setP({ ...p, aktif: e.target.checked })} className="peer sr-only" />
        <span className="relative h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-[#5F33E1] after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
      </label>

      <fieldset disabled={!p.aktif} className="mt-5 space-y-5 disabled:opacity-50">
        <div>
          <p className="mb-3 text-base font-medium text-[#24252C]">Jenis Notifikasi</p>
          <div className="space-y-2">
            {JENIS_NOTIFIKASI.map((j) => (
              <label key={j} className="flex items-center gap-3 rounded-xl border border-[#E6E6EA] bg-white px-4 py-3">
                <input
                  type="checkbox"
                  className="size-5 accent-[#5F33E1]"
                  checked={p.jenis.includes(j)}
                  onChange={(e) => setP({ ...p, jenis: e.target.checked ? [...p.jenis, j] : p.jenis.filter((x) => x !== j) })}
                />
                <span className="text-sm text-[#24252C]">{j}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-base font-medium text-[#24252C]">Jadwal Pengingat</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Waktu">
              <input type="time" value={p.waktuPengingat} onChange={(e) => setP({ ...p, waktuPengingat: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Frekuensi">
              <select value={p.frekuensi} onChange={(e) => setP({ ...p, frekuensi: e.target.value })} className={inputClass}>
                {FREKUENSI.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      </fieldset>

      <Button className="mt-8 w-full" loading={loading} onClick={simpan}>
        Simpan Pengaturan
      </Button>
    </Screen>
  )
}
