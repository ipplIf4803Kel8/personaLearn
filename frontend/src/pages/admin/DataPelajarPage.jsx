import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { useFetch } from '@/lib/use-fetch'
import { useAdminAction } from '@/components/admin/useAdminAction'
import { ActionError, PageState, STICKY_ACTION } from '@/components/admin/PageState'
import { matchesQuery, useAdminNavigation } from '@/components/admin/AdminNavigation'

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
}

// Panel detail: profil, preferensi, progres per kelas, dan ubah status akun
function StudentDetail({ studentId, onChanged }) {
  const { data: student, loading, error, reload } = useFetch(`/admin/students/${studentId}`)
  const [run, actionError] = useAdminAction(async () => {
    await reload()
    await onChanged()
  })

  if (!student) {
    return (
      <div className="flex-1 space-y-3 px-4">
        {loading ? (
          <div role="status" aria-label="Memuat detail pelajar" className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  }

  const { preferences, enrollments = [] } = student

  return (
    <>
      <SheetHeader>
        <SheetTitle>{student.name}</SheetTitle>
      </SheetHeader>
      <div className="flex-1 space-y-6 px-4">
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span> {student.email}
          </p>
          <p>
            <span className="text-muted-foreground">Telepon:</span> {student.phone ?? '-'}
          </p>
          <p>
            <span className="text-muted-foreground">Status:</span>{' '}
            <Badge variant={student.isActive ? 'default' : 'secondary'}>{student.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
          </p>
        </div>

        <div className="space-y-1 text-sm">
          <p className="font-medium">Preferensi Belajar</p>
          <p className="text-muted-foreground">
            MBTI: {preferences?.mbtiType ?? 'Belum diisi'} &middot; Gaya belajar: {preferences?.varkStyle ?? 'Belum diisi'}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Kelas yang Diambil</p>
          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum mengambil kelas apa pun.</p>
          ) : (
            <div className="space-y-3">
              {enrollments.map((e) => (
                <div key={e.courseId} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{e.title}</span>
                    <span className="shrink-0 text-muted-foreground">{e.progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${e.progressPercent}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {e.completedLessons} dari {e.totalLessons} pelajaran &middot; mulai {formatDate(e.enrolledAt)}
                    {e.completedAt && ` · selesai ${formatDate(e.completedAt)}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <ActionError message={actionError} />
        <Button
          variant={student.isActive ? 'destructive' : 'default'}
          onClick={() =>
            run(() => api(`/admin/students/${student.id}/status`, { method: 'PATCH', body: { isActive: !student.isActive } }))
          }
        >
          {student.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
        </Button>
      </div>
    </>
  )
}

// UC11 Data Pelajar
function DataPelajarPage() {
  const { data, loading, error, reload } = useFetch('/admin/students')
  const [selectedId, setSelectedId] = useState(null)
  const { query } = useAdminNavigation()
  const students = (data ?? []).filter((s) => matchesQuery(query, s.name, s.email))

  if (!data) return <PageState loading={loading} error={error} />

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <h2 className="text-2xl font-semibold">Pelajar</h2>

      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pelajar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className={`text-right ${STICKY_ACTION}`}>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  {data.length === 0 ? 'Belum ada pelajar terdaftar.' : 'Tidak ada pelajar yang cocok.'}
                </TableCell>
              </TableRow>
            )}
            {students.map((student) => (
              <TableRow key={student.id} className="cursor-pointer" onClick={() => setSelectedId(student.id)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={student.avatarUrl} alt={student.name} />
                      <AvatarFallback>{initials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{student.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={student.isActive ? 'default' : 'secondary'}>
                    {student.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </TableCell>
                <TableCell className={`text-right ${STICKY_ACTION}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelectedId(student.id)
                    }}
                  >
                    Lihat Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={selectedId !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="overflow-y-auto">
          {selectedId !== null && <StudentDetail key={selectedId} studentId={selectedId} onChanged={reload} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export { DataPelajarPage }
