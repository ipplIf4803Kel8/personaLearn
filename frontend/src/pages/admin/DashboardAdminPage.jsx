'use client'
import { BookOpen, CheckCircle2, Tags, Users } from 'lucide-react'
import { jumlahPelajar, useDb } from '@/data/db'

// UC1-L10 Dashboard Admin: ringkasan jumlah pelajar, kelas, kategori, dan kelas terpopuler.
function DashboardAdminPage() {
  const { db } = useDb()
  const pelajar = db.pengguna.filter((u) => u.peran === 'pelajar')
  const stats = [
    { label: 'Total Pelajar', value: pelajar.length, icon: Users },
    { label: 'Total Kelas', value: db.kelas.filter((k) => k.status !== 'disembunyikan').length, icon: BookOpen },
    { label: 'Total Kategori', value: db.kategori.length, icon: Tags },
    { label: 'Kelas Terbit', value: db.kelas.filter((k) => k.status === 'terbit').length, icon: CheckCircle2 },
  ]
  const terpopuler = db.kelas
    .filter((k) => k.status === 'terbit')
    .map((k) => ({ ...k, jumlah: jumlahPelajar(db, k.id) }))
    .sort((a, b) => b.jumlah - a.jumlah || b.rating - a.rating)
    .slice(0, 5)
  const mingguan = Array.from({ length: 6 }, (_, i) => {
    const akhir = Date.now() - (5 - i) * 7 * 864e5
    const awal = akhir - 7 * 864e5
    return {
      label: `M${i + 1}`,
      count: pelajar.filter((u) => {
        const t = new Date(u.dibuatPada).getTime()
        return t > awal && t <= akhir
      }).length,
    }
  })

  return (
    <div data-screen="UC1-L10" className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>

      <div className="flex flex-col gap-8 lg:flex-row">
        <WeeklySignupsChart data={mingguan} />
        <TopCoursesList courses={terpopuler} />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border p-5">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function WeeklySignupsChart({ data }) {
  const max = Math.max(1, ...data.map((item) => item.count))
  return (
    <section className="flex flex-1 flex-col gap-6 rounded-2xl border p-5">
      <div>
        <h2 className="text-lg font-semibold">Pendaftaran Pelajar per Minggu</h2>
        <p className="text-sm text-muted-foreground">Jumlah pelajar baru dalam 6 minggu terakhir</p>
      </div>
      <div className="flex h-48 gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs text-muted-foreground">{item.count}</span>
            <div className="w-full rounded-t-md bg-primary" style={{ height: `${Math.max(2, (item.count / max) * 100)}%` }} title={`${item.label}: ${item.count} pendaftar`} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function TopCoursesList({ courses }) {
  return (
    <section className="flex flex-1 flex-col gap-6 rounded-2xl border p-5 lg:max-w-sm">
      <h2 className="text-lg font-semibold">5 Kelas Terpopuler</h2>
      <ol className="flex flex-col gap-4">
        {courses.map((course, index) => (
          <li key={course.id} className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{course.nama}</p>
              <p className="text-xs text-muted-foreground">
                {course.jumlah} pelajar &middot; rating {course.rating}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export { DashboardAdminPage }
