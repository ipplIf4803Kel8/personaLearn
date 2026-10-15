'use client'
import { BookOpen, CheckCircle2, GraduationCap, Users } from 'lucide-react'
import { getStats, getTopCourses, weeklySignups } from '../../data'

const statCards = [
  { key: 'totalStudents', label: 'Total Pelajar', icon: Users },
  { key: 'totalCourses', label: 'Total Kelas', icon: BookOpen },
  { key: 'activeStudents7d', label: 'Pelajar Aktif 7 Hari Terakhir', icon: GraduationCap },
  { key: 'lessonsCompletedThisWeek', label: 'Pelajaran Diselesaikan Minggu Ini', icon: CheckCircle2 },
]

function DashboardContent() {
  const stats = getStats()
  const topCourses = getTopCourses(5)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.key} label={card.label} value={stats[card.key]} icon={card.icon} />
        ))}
      </section>

      <div className="flex flex-col gap-8 lg:flex-row">
        <WeeklySignupsChart />
        <TopCoursesList courses={topCourses} />
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

function WeeklySignupsChart() {
  const max = Math.max(...weeklySignups.map((item) => item.count))

  return (
    <section className="flex flex-1 flex-col gap-6 rounded-2xl border p-5">
      <div>
        <h2 className="text-lg font-semibold">Pendaftaran Pelajar per Minggu</h2>
        <p className="text-sm text-muted-foreground">Jumlah pelajar baru yang mendaftar tiap minggu</p>
      </div>
      <div className="flex h-48 gap-3">
        {weeklySignups.map((item) => (
          <div key={item.week} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div
              className="w-full rounded-t-md bg-primary"
              style={{ height: `${(item.count / max) * 100}%` }}
              title={`${item.week}: ${item.count} pendaftar`}
            />
            <span className="text-xs text-muted-foreground">{item.week.replace('Minggu ', 'M')}</span>
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
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{course.title}</p>
              <p className="text-xs text-muted-foreground">
                {course.studentsCount} pelajar &middot; rating {course.rating}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export { DashboardContent }
