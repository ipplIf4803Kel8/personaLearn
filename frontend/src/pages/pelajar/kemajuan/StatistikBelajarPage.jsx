import { useMemo, useState } from 'react'
import { MdFileDownload, MdInsights } from 'react-icons/md'
import { Chip } from '@/components/pelajar/Chip'
import { SectionTitle, Screen } from '@/components/pelajar/Screen'
import { Loading, ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { penggunaAktif, useDb } from '@/data/db'
import { useAsync } from '@/hooks/useAsync'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

export const PERIODE = [
  { id: 7, label: '7 Hari' },
  { id: 30, label: '30 Hari' },
]

// UC3-L05 Statistik Belajar (alur B ekspor, E belum ada data, F gagal)
export function StatistikBelajarPage() {
  const { navigate } = useRouter()
  const { db, aksi } = useDb()
  const toast = useToast()
  const u = penggunaAktif(db)
  const [periode, setPeriode] = useState(7)
  const [mengekspor, setMengekspor] = useState(false)
  const muat = useAsync(() => aksi.muatRingkasan(), [periode])
  const data = useMemo(() => {
    const batas = Date.now() - periode * 864e5
    const riwayat = db.riwayatBelajar.filter((r) => r.idPengguna === u?.id && new Date(r.tanggal).getTime() >= batas)
    const hari = Array.from({ length: Math.min(periode, 7) }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (Math.min(periode, 7) - 1 - i))
      const menit = riwayat.filter((r) => new Date(r.tanggal).toDateString() === d.toDateString()).reduce((s, r) => s + r.menit, 0)
      return { label: d.toLocaleDateString('id-ID', { weekday: 'short' }), menit }
    })
    return {
      riwayat: [...riwayat].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
      menit: riwayat.reduce((s, r) => s + r.menit, 0),
      materi: riwayat.reduce((s, r) => s + r.materiSelesai, 0),
      hari,
    }
  }, [db, u, periode])
  const maks = Math.max(30, ...data.hari.map((h) => h.menit))

  async function ekspor() {
    setMengekspor(true)
    try {
      const csv = await aksi.eksporDataProgres()
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'data-progres-personalearn.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast('Data progres berhasil diunduh')
    } catch {
      toast('Ekspor gagal. Coba lagi.', 'gagal')
    } finally {
      setMengekspor(false)
    }
  }

  return (
    <Screen kode="UC3-L05" back title="Statistik Belajar" bell>
      <div className="flex gap-2">
        {PERIODE.map((p) => (
          <Chip key={p.id} aktif={periode === p.id} onClick={() => setPeriode(p.id)}>
            {p.label}
          </Chip>
        ))}
      </div>
      {muat.memuat ? (
        <Loading />
      ) : muat.gagal ? (
        <ErrorState title="Statistik gagal dimuat" onRetry={muat.ulangi} />
      ) : data.riwayat.length === 0 ? (
        <EmptyState icon={MdInsights} title="Belum ada data belajar" desc="Mulai belajar untuk melihat statistik Anda." action={<Button className="py-3" onClick={() => navigate('/kelas-anda')}>Lanjut Belajar</Button>} />
      ) : (
        <>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              ['Jam belajar', (data.menit / 60).toFixed(1)],
              ['Materi selesai', data.materi],
              ['Streak', `${u?.streak} hari`],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-white px-2 py-4 shadow-[0_6px_20px_rgba(36,37,44,0.07)]">
                <p className={cn('text-lg font-semibold text-[#5F33E1]', HEADING_FONT)}>{v}</p>
                <p className="text-xs text-[#6E6A7C]">{l}</p>
              </div>
            ))}
          </div>

          <SectionTitle>Grafik Harian (menit)</SectionTitle>
          <div className="flex h-44 items-end gap-2 rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(36,37,44,0.07)]" role="img" aria-label="Grafik menit belajar harian">
            {data.hari.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[11px] text-[#6E6A7C]">{h.menit || ''}</span>
                <div className="w-full rounded-t-lg bg-[#5F33E1]" style={{ height: `${(h.menit / maks) * 100}px`, opacity: h.menit ? 1 : 0.15, minHeight: 4 }} />
                <span className="text-[11px] text-[#6E6A7C]">{h.label}</span>
              </div>
            ))}
          </div>

          <SectionTitle>Riwayat</SectionTitle>
          <ul className="space-y-2">
            {data.riwayat.slice(0, 6).map((r, i) => (
              <li key={i} className="flex items-center justify-between rounded-2xl bg-[#F7F7F9] px-4 py-3">
                <span className="font-medium text-[#24252C]">{new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                <span className="text-[#6E6A7C]">
                  {r.menit} menit · {r.materiSelesai} materi
                </span>
              </li>
            ))}
          </ul>

          <Button className="mt-6 w-full" loading={mengekspor} onClick={ekspor}>
            <MdFileDownload className="size-5" /> Ekspor Data Progres
          </Button>
        </>
      )}
    </Screen>
  )
}
