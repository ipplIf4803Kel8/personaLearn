'use client'
import { useFetch } from '@/lib/use-fetch'
import { PageState } from './page-state'

function ReportsContent() {
  const { data, loading, error } = useFetch('/admin/reports')
  if (!data) return <PageState loading={loading} error={error} />
  const { progressByCourse, highestRated: highest, lowestRated: lowest, chatMessageStats } = data

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <h2 className="text-2xl font-semibold">Laporan</h2>

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

export { ReportsContent }
