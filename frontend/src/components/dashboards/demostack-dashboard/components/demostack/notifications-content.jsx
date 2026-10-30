'use client'
import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { useAction, useFetch } from '@/lib/use-fetch'
import { ActionError, PageState } from './page-state'

const ALL_STUDENTS = 'all'

function formatDateTime(value) {
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function NotificationsContent() {
  const { data, loading, error, reload } = useFetch('/admin/notifications')
  const { data: studentList } = useFetch('/admin/students')
  const [run, actionError] = useAction(reload)
  const notifications = data ?? []
  const students = studentList ?? []
  const [audience, setAudience] = useState(ALL_STUDENTS)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(event.currentTarget)
    const title = formData.get('title').trim()
    const body = formData.get('body').trim()
    if (!title || !body) return

    const audienceName =
      audience === ALL_STUDENTS ? 'Semua Pelajar' : students.find((student) => String(student.id) === audience)?.name
    const ok = await run(() => api('/admin/notifications', { method: 'POST', body: { title, body, audience: audienceName } }))
    if (ok) {
      form.reset()
      setAudience(ALL_STUDENTS)
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
            <label htmlFor="notification-title" className="text-sm font-medium">
              Judul
            </label>
            <Input id="notification-title" name="title" required />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="notification-body" className="text-sm font-medium">
              Isi Pesan
            </label>
            <textarea
              id="notification-body"
              name="body"
              rows={3}
              required
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tujuan</label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STUDENTS}>Semua Pelajar</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={String(student.id)}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ActionError message={actionError} />
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
                <TableHead>Tujuan</TableHead>
                <TableHead className="text-right">Waktu Kirim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.body}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{notification.audience}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatDateTime(notification.sentAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export { NotificationsContent }
