import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFetch } from '@/lib/use-fetch'
import { PageState } from '@/components/admin/PageState'

// Awalan ' mencegah Excel/Sheets menjalankan sel yang diawali = + - @ sebagai rumus.
const csvCell = (v) => `"${String(v ?? '').replace(/^([=+\-@])/, "'$1").replace(/"/g, '""')}"`

function downloadCsv(data, range) {
  const { progressByCourse, period, chatMessageStats } = data
  const rows = [
    ['Rentang', range.from || 'awal', range.to || 'sekarang'],
    ['Pelajar baru', period.newStudents],
    ['Pelajaran selesai', period.lessonsCompleted],
    ['Pesan ke Sinau Bot', period.chatMessages],
    ['Total pesan bot (semua waktu)', chatMessageStats.totalMessages],
    [],
    ['Kelas', 'Progres rata-rata (%)', 'Jumlah pelajar'],
    ...progressByCourse.map((c) => [c.title, c.averageProgress, c.enrolledCount]),
  ]
  const blob = new Blob(['\uFEFF' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'laporan.csv' })
  a.click()
  URL.revokeObjectURL(a.href)
}

// Laporan — data dari backend (kode dari teman, dipindah ke struktur baru)
function AdminReportsPage() {
  const [range, setRange] = useState({ from: '', to: '' })
  const invalid = range.from && range.to && range.from > range.to
  const params = new URLSearchParams(invalid ? {} : Object.fromEntries(Object.entries(range).filter(([, v]) => v)))
  const { data, loading, error } = useFetch(`/admin/reports?${params}`)
  if (!data) return <PageState loading={loading} error={error} />
  const { progressByCourse, highestRated: highest, lowestRated: lowest, chatMessageStats, period } = data

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold">Laporan</h2>
        <Button variant="outline" className="gap-1" onClick={() => downloadCsv(data, invalid ? { from: '', to: '' } : range)}>
          <Download className="size-4" />
          Ekspor CSV
        </Button>
      </div>

      <section className="space-y-3 rounded-2xl border p-5">
        <h3 className="font-semibold">Aktivitas pada Rentang Tanggal</h3>
        <div className="flex flex-wrap gap-3">
          {[['from', 'Dari'], ['to', 'Sampai']].map(([key, label]) => (
            <label key={key} className="space-y-1 text-sm font-medium">
              {label}
              <Input type="date" value={range[key]} onChange={(e) => setRange({ ...range, [key]: e.target.value })} />
            </label>
          ))}
        </div>
        {invalid && <p className="text-sm text-destructive">Tanggal awal tidak boleh setelah tanggal akhir.</p>}
        <p className="text-sm text-muted-foreground">
          {period.newStudents} pelajar baru &middot; {period.lessonsCompleted} pelajaran selesai &middot;{' '}
          {period.chatMessages} pesan ke Sinau Bot
          {!range.from && !range.to && ' (semua waktu)'}
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h3 className="font-semibold">Progres Rata-rata per Kelas</h3>
        <div className="space-y-3">
          {progressByCourse.map(({ id, title, averageProgress, enrolledCount }) => (
            <div key={id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{title}</span>
                <span className="text-muted-foreground">
                  {averageProgress}% &middot; {enrolledCount} pelajar
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${averageProgress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 rounded-2xl border p-5">
          <h3 className="font-semibold">Rating Tertinggi</h3>
          {highest ? (
            <>
              <p className="font-medium">{highest.title}</p>
              <p className="text-sm text-muted-foreground">Rating {highest.rating}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada data</p>
          )}
        </div>
        <div className="space-y-2 rounded-2xl border p-5">
          <h3 className="font-semibold">Rating Terendah</h3>
          {lowest ? (
            <>
              <p className="font-medium">{lowest.title}</p>
              <p className="text-sm text-muted-foreground">Rating {lowest.rating}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada data</p>
          )}
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border p-5">
        <h3 className="font-semibold">Pesan ke Sinau Bot</h3>
        <p className="text-sm text-muted-foreground">
          {chatMessageStats.totalMessages} pesan total &middot; {chatMessageStats.thisWeek} pesan minggu ini
        </p>
      </section>
    </div>
  )
}

export { AdminReportsPage }
