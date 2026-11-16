import { useMemo, useState } from 'react'
import { MdFileDownload, MdInsights } from 'react-icons/md'
import { Chip } from '@/components/pelajar/Chip'
import { SectionTitle, Screen } from '@/components/pelajar/Screen'
import { Loading, ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { muatStatistik } from '@/data/learningApi'
import { useAsync } from '@/hooks/useAsync'
import { aktivitasKeCsv, aktivitasPerHari, formatDurasi } from '@/lib/learning'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

export const PERIODE = [
  { id: 7, label: '7 Hari' },
  { id: 30, label: '30 Hari' },
]

// UC3-L05 Statistik Belajar (alur B ekspor, E belum ada data, F gagal)
export function StatistikBelajarPage() {
  const { navigate } = useRouter()
  const toast = useToast()
  const [periode, setPeriode] = useState(7)
  const muat = useAsync(muatStatistik, [])
  const stat = muat.data
  const hari = useMemo(() => aktivitasPerHari(stat?.activity ?? [], periode), [stat, periode])
  const aktif = hari.filter((h) => h.lessons > 0)
  const detik = hari.reduce((s, h) => s + h.detik, 0)
  const materi = hari.reduce((s, h) => s + h.lessons, 0)
  const maks = Math.max(30, ...hari.map((h) => h.menit))

  function ekspor() {
    const url = URL.createObjectURL(new Blob([aktivitasKeCsv(hari)], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'data-progres-personalearn.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast('Data progres berhasil diunduh')
  }

  return (
    <Screen kode="UC3-L05" back title="Statistik Belajar" bell>
      <div className="mt-2 mb-5 flex gap-2">
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
      ) : aktif.length === 0 ? (
        <EmptyState icon={MdInsights} title="Belum ada data belajar" desc="Mulai belajar untuk melihat statistik Anda." action={<Button className="py-3" onClick={() => navigate('/kelas-anda')}>Lanjut Belajar</Button>} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ['Waktu belajar', formatDurasi(detik)],
              ['Materi selesai', materi],
              ['Streak', `${stat?.currentStreak ?? 0} hari`],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-white px-2 py-4 shadow-[0_6px_20px_rgba(36,37,44,0.07)]">
                <p className={cn('text-lg font-semibold text-[#5F33E1]', HEADING_FONT)}>{v}</p>
                <p className="text-xs text-[#6E6A7C]">{l}</p>
              </div>
            ))}
          </div>

          <SectionTitle>Grafik Harian (menit)</SectionTitle>
          <div className="flex h-44 items-end gap-2 rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(36,37,44,0.07)]" role="img" aria-label="Grafik menit belajar harian">
            {hari.map((h) => (
              <div key={h.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span className="text-[11px] text-[#6E6A7C]">{periode === 7 && h.menit ? h.menit : ''}</span>
                <div className="w-full rounded-t-lg bg-[#5F33E1]" style={{ height: `${(h.menit / maks) * 100}px`, opacity: h.menit ? 1 : 0.15, minHeight: 4 }} />
                <span className="text-[11px] text-[#6E6A7C]">{periode === 7 ? new Date(h.date).toLocaleDateString('id-ID', { weekday: 'short' }) : ''}</span>
              </div>
            ))}
          </div>

          <SectionTitle>Riwayat</SectionTitle>
          <ul className="space-y-2">
            {[...aktif].reverse().slice(0, 6).map((r) => (
              <li key={r.date} className="flex items-center justify-between rounded-2xl bg-[#F7F7F9] px-4 py-3">
                <span className="font-medium text-[#24252C]">{new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                <span className="text-[#6E6A7C]">
                  {formatDurasi(r.detik)}, {r.lessons} materi
                </span>
              </li>
            ))}
          </ul>

          <Button className="mt-6 w-full" onClick={ekspor}>
            <MdFileDownload className="size-5" /> Ekspor Data Progres
          </Button>
        </>
      )}
    </Screen>
  )
}
