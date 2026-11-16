import { BookOpen, CheckCircle2, GraduationCap, Users } from 'lucide-react'
import { useFetch } from '@/lib/use-fetch'
import { PageState } from '@/components/admin/PageState'

const statCards = [
  { key: 'totalStudents', label: 'Total Pelajar', icon: Users },
  { key: 'totalCourses', label: 'Total Kelas', icon: BookOpen },
  { key: 'activeStudents7d', label: 'Pelajar Aktif 7 Hari Terakhir', icon: GraduationCap },
  { key: 'lessonsCompletedThisWeek', label: 'Pelajaran Diselesaikan Minggu Ini', icon: CheckCircle2 },
]

// UC1-L10 Dashboard Admin
function DashboardAdminPage() {
  const { data: stats, loading, error } = useFetch('/admin/stats')
  const { data: courses } = useFetch('/admin/courses')
  // /admin/stats hanya memberi total semua kelas; jumlah terbit dihitung dari daftar kelas
  const published = courses ? courses.filter((c) => c.isPublished).length : null
  if (!stats) return <PageState loading={loading} error={error} />

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.key} label={card.label}
            value={stats[card.key]}
            icon={card.icon}
            hint={card.key === 'totalCourses' && published !== null ? `${published} terbit, ${stats.totalCourses - published} draf` : null}
          />
        ))}
      </section>

      <div className="flex flex-col gap-8 lg:flex-row">
        <WeeklySignupsChart weeklySignups={stats.weeklySignups} />
        <TopCoursesList courses={stats.topCourses} />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, hint }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border p-5">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )
}

function WeeklySignupsChart({ weeklySignups }) {
  const max = Math.max(1, ...weeklySignups.map((item) => item.count))

  return (
    <section className="flex flex-1 flex-col gap-6 rounded-2xl border p-5">
      <div>
        <h2 className="text-lg font-semibold">Pendaftaran Pelajar per Minggu</h2>
        <p className="text-sm text-muted-foreground">Jumlah pelajar baru yang mendaftar tiap minggu</p>
      </div>
      <div
        role="img"
        aria-label={`Pendaftaran per minggu: ${weeklySignups.map((i) => `${i.week} ${i.count}`).join(', ')}`}
        className="flex h-52 gap-3 border-b pt-5"
      >
        {weeklySignups.map((item) => (
          <div key={item.week} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${item.week}: ${item.count} pendaftar`}>
            <span className="mb-1 text-center text-xs font-medium">{item.count}</span>
            <div
              className="w-full rounded-t-md bg-primary"
              style={{ height: `calc((100% - 1.5rem) * ${item.count / max})`, minHeight: item.count ? undefined : 2 }}
            />
          </div>
        ))}
      </div>
      <div className="-mt-3 flex gap-3" aria-hidden="true">
        {weeklySignups.map((item) => (
          <span key={item.week} className="min-w-0 flex-1 truncate text-center text-xs text-muted-foreground">
            {item.week}
          </span>
        ))}
      </div>
    </section>
  )
}

function TopCoursesList({ courses }) {
  return (
    <section className="flex flex-1 flex-col gap-6 rounded-2xl border p-5 lg:max-w-sm">
      <h2 className="text-lg font-semibold">5 Kelas Terpopuler</h2>
      {courses.length === 0 && <p className="text-sm text-muted-foreground">Belum ada kelas.</p>}
      <ol className="flex flex-col gap-4">
        {courses.map((course, index) => (
          <li key={course.id} className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{course.title}</p>
              <p className="text-xs text-muted-foreground">
                {course.studentsCount} pelajar &middot; rating {course.rating ?? '-'}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export { DashboardAdminPage }
