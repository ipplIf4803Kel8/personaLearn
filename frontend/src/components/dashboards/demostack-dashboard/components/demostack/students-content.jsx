'use client'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { useAction, useFetch } from '@/lib/use-fetch'
import { ActionError, PageState } from './page-state'

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function StudentsContent() {
  const { data, loading, error, reload } = useFetch('/admin/students')
  const { data: courses } = useFetch('/admin/courses')
  const [run, actionError] = useAction(reload)
  const [selected, setSelected] = useState(null)
  const students = data ?? []

  const courseTitle = (courseId) =>
    (courses ?? []).find((course) => course.id === courseId)?.title ?? 'Kelas tidak ditemukan'

  async function toggleActive(student) {
    const isActive = !student.isActive
    const ok = await run(() => api(`/admin/students/${student.id}/active`, { method: 'PATCH', body: { isActive } }))
    if (ok) setSelected((current) => current && { ...current, isActive })
  }

  if (!data) return <PageState loading={loading} error={error} />

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <h2 className="text-2xl font-semibold">Pelajar</h2>
      <ActionError message={actionError} />

      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pelajar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
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
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setSelected(student)}>
                    Lihat Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 space-y-6 px-4">
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Email:</span> {selected.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Telepon:</span> {selected.phone ?? '-'}
                  </p>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-medium">Preferensi Belajar</p>
                  <p className="text-muted-foreground">
                    MBTI: {selected.mbtiType ?? 'Belum diisi'} &middot; Gaya belajar: {selected.varkStyle ?? 'Belum diisi'}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Kelas yang Diambil</p>
                  {selected.enrollments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum mengambil kelas apa pun.</p>
                  ) : (
                    <div className="space-y-3">
                      {selected.enrollments.map((enrollment) => (
                        <div key={enrollment.courseId} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{courseTitle(enrollment.courseId)}</span>
                            <span className="text-muted-foreground">{enrollment.progressPercent}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${enrollment.progressPercent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant={selected.isActive ? 'destructive' : 'default'}
                  onClick={() => toggleActive(selected)}
                >
                  {selected.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export { StudentsContent }
