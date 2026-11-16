import { useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { validateNotification } from '@/lib/adminValidation'
import { useAction, useFetch } from '@/lib/use-fetch'
import { ActionError, FieldError, PageState, STICKY_ACTION } from '@/components/admin/PageState'
import { matchesQuery, useAdminNavigation } from '@/components/admin/AdminNavigation'

const ALL_STUDENTS = 'all'
const ONE_STUDENT = 'one'

function formatDateTime(value) {
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

// Kirim Notifikasi
function AdminNotificationsPage() {
  const { data, loading, error, reload } = useFetch('/admin/notifications')
  const { data: studentList } = useFetch('/admin/students')
  const [run, actionError] = useAction(reload)
  const { query } = useAdminNavigation()
  const notifications = (data ?? []).filter((n) => matchesQuery(query, n.title, n.body, n.audience))
  const students = studentList ?? []
  const [mode, setMode] = useState(ALL_STUDENTS)
  const [studentId, setStudentId] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [errors, setErrors] = useState({})
  const [sentTo, setSentTo] = useState(null)
  const matchingStudents = students.filter((s) => matchesQuery(studentSearch, s.name, s.email))

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const title = formData.get('title').trim()
    const body = formData.get('body').trim()
    const found = validateNotification({ title, body })
    if (mode === ONE_STUDENT && !studentId) found.studentId = 'Pilih pelajar penerima'
    setErrors(found)
    setSentTo(null)
    if (Object.keys(found).length) return

    const payload = mode === ONE_STUDENT ? { title, body, userId: Number(studentId) } : { title, body }
    let result
    const ok = await run(async () => {
      result = await api('/admin/notifications', { method: 'POST', body: payload })
    })
    if (ok) {
      form.reset()
      setMode(ALL_STUDENTS)
      setStudentId('')
      setStudentSearch('')
      setSentTo(result?.recipients ?? 0)
    }
  }

  function handleDelete(notification) {
    if (window.confirm(`Hapus notifikasi "${notification.title}"?`)) {
      run(() => api(`/admin/notifications/${notification.id}`, { method: 'DELETE' }))
    }
  }

  if (!data) return <PageState loading={loading} error={error} />

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <h2 className="text-2xl font-semibold">Notifikasi</h2>

      <div className="space-y-4 rounded-2xl border p-5">
        <h3 className="font-semibold">Kirim Notifikasi</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="notification-title" className="block text-sm font-medium">
              Judul
            </label>
            <Input id="notification-title" name="title" aria-invalid={!!errors.title} />
            <FieldError message={errors.title} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="notification-body" className="block text-sm font-medium">
              Isi Pesan
            </label>
            <textarea
              id="notification-body"
              name="body"
              rows={3}
              aria-invalid={!!errors.body}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <FieldError message={errors.body} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Penerima</label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STUDENTS}>Semua pelajar</SelectItem>
                <SelectItem value={ONE_STUDENT}>Pelajar tertentu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {mode === ONE_STUDENT && (
            <div className="space-y-1.5">
              <label htmlFor="notification-student-search" className="mb-1 block text-sm font-medium">
                Cari pelajar
              </label>
              <Input
                id="notification-student-search"
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Nama atau email"
                className="sm:w-72"
              />
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="w-full sm:w-72" aria-invalid={!!errors.studentId}>
                  <SelectValue placeholder="Pilih pelajar" />
                </SelectTrigger>
                <SelectContent>
                  {matchingStudents.length === 0 && (
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">Tidak ada pelajar yang cocok.</p>
                  )}
                  {matchingStudents.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.studentId} />
            </div>
          )}
          <ActionError message={actionError} />
          {sentTo !== null && !actionError && (
            <p role="status" className="text-sm text-primary">
              Terkirim ke {sentTo} pelajar
            </p>
          )}
          <Button type="submit" className="gap-1">
            <Send className="size-4" />
            Kirim
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Riwayat Notifikasi Terkirim</h3>
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notifikasi</TableHead>
                <TableHead className="hidden md:table-cell">Tujuan</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Waktu Kirim</TableHead>
                <TableHead className={`w-12 ${STICKY_ACTION}`}>
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Belum ada notifikasi terkirim.
                  </TableCell>
                </TableRow>
              )}
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="max-w-72 whitespace-normal">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.body}</p>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{notification.audience}</TableCell>
                  <TableCell className="hidden text-right text-muted-foreground lg:table-cell">{formatDateTime(notification.sentAt)}</TableCell>
                  <TableCell className={STICKY_ACTION}>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Hapus ${notification.title}`}
                      onClick={() => handleDelete(notification)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export { AdminNotificationsPage }
