import { useState } from 'react'
import { useParams } from 'react-router'
import { ArrowLeft, ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { useAction, useFetch } from '@/lib/use-fetch'
import { useRouter } from '@/lib/router'
import { ActionError, PageState } from '@/components/admin/PageState'

function formatDuration(seconds) {
  const minutes = Math.round(seconds / 60)
  return `${minutes} menit`
}

// UC9 Kelola Pelajaran dalam Kelas — data dari backend (kode dari teman, dipindah ke struktur baru)
function DetailKelasPage() {
  const { id } = useParams()
  const { navigate } = useRouter()
  const { data: courses } = useFetch('/admin/courses')
  const course = courses?.find((item) => item.id === Number(id))
  const onBack = () => navigate('/admin/kelas')
  const lessonsPath = `/admin/courses/${id}/lessons`
  const { data, loading, error, reload } = useFetch(lessonsPath)
  const [run, actionError] = useAction(reload)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const sortedLessons = data ?? []

  function openCreate() {
    setEditing({ id: null, title: '', videoUrl: '', durationMinutes: '', description: '' })
    setSheetOpen(true)
  }

  function openEdit(lesson) {
    setEditing({ ...lesson, durationMinutes: Math.round(lesson.durationSeconds / 60) })
    setSheetOpen(true)
  }

  function handleDelete(lesson) {
    if (!confirm(`Hapus pelajaran "${lesson.title}"?`)) return
    run(() => api(`/admin/lessons/${lesson.id}`, { method: 'DELETE' }))
  }

  function move(id, direction) {
    const index = sortedLessons.findIndex((lesson) => lesson.id === id)
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= sortedLessons.length) return
    const reordered = [...sortedLessons]
    ;[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]]
    run(() => api(`${lessonsPath}/reorder`, { method: 'PATCH', body: { ids: reordered.map((lesson) => lesson.id) } }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = formData.get('title').trim()
    const videoUrl = formData.get('videoUrl').trim()
    const durationSeconds = Math.max(0, Number(formData.get('durationMinutes')) * 60)
    const description = formData.get('description').trim()
    if (!title) return

    const body = { title, videoUrl, durationSeconds, description }
    const request = editing.id
      ? api(`/admin/lessons/${editing.id}`, { method: 'PATCH', body })
      : api(lessonsPath, { method: 'POST', body })
    if (await run(() => request)) setSheetOpen(false)
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <Button variant="ghost" size="sm" className="gap-1 px-0" onClick={onBack}>
        <ArrowLeft className="size-4" />
        Kembali ke Daftar Kelas
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pelajaran</h2>
          <p className="text-sm text-muted-foreground">{course?.title}</p>
        </div>
        <Button className="gap-1 rounded-xl" onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Pelajaran
        </Button>
      </div>

      <ActionError message={actionError} />

      {!data ? (
        <PageState loading={loading} error={error} />
      ) : sortedLessons.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center">
          <p className="font-medium">Belum ada pelajaran</p>
          <p className="text-sm text-muted-foreground">Tambahkan pelajaran pertama untuk kelas ini.</p>
        </div>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Durasi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLessons.map((lesson, index) => (
                <TableRow key={lesson.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{lesson.title}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDuration(lesson.durationSeconds)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="icon-sm" aria-label="Naikkan urutan" onClick={() => move(lesson.id, -1)}>
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon-sm" aria-label="Turunkan urutan" onClick={() => move(lesson.id, 1)}>
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon-sm" aria-label={`Ubah ${lesson.title}`} onClick={() => openEdit(lesson)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Hapus ${lesson.title}`}
                        onClick={() => handleDelete(lesson)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          {editing && (
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing.id ? 'Ubah Pelajaran' : 'Tambah Pelajaran'}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <label htmlFor="lesson-title" className="text-sm font-medium">
                    Judul
                  </label>
                  <Input id="lesson-title" name="title" defaultValue={editing.title} required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lesson-video" className="text-sm font-medium">
                    URL Video
                  </label>
                  <Input id="lesson-video" name="videoUrl" defaultValue={editing.videoUrl} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lesson-duration" className="text-sm font-medium">
                    Durasi (menit)
                  </label>
                  <Input id="lesson-duration" name="durationMinutes" type="number" min="0" defaultValue={editing.durationMinutes} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lesson-description" className="text-sm font-medium">
                    Deskripsi / Ringkasan Materi
                  </label>
                  <textarea
                    id="lesson-description"
                    name="description"
                    defaultValue={editing.description}
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </div>
              </div>
              <SheetFooter>
                <Button type="submit">Simpan</Button>
                <SheetClose asChild>
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </SheetClose>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export { DetailKelasPage }
