'use client'
import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { useAction, useFetch } from '@/lib/use-fetch'
import { ActionError, PageState } from './page-state'

const NO_COURSE = 'none'

function formatDate(value) {
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ChallengesContent() {
  const { data, loading, error, reload } = useFetch('/admin/challenges')
  const { data: courses } = useFetch('/admin/courses')
  const [run, actionError] = useAction(reload)
  const challenges = data ?? []
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  function courseTitle(courseId) {
    return (courses ?? []).find((course) => course.id === courseId)?.title ?? 'Semua Kelas'
  }

  function openCreate() {
    setEditing({ id: null, title: '', description: '', rewardPoints: 10, startsAt: '', endsAt: '', courseId: NO_COURSE })
    setSheetOpen(true)
  }

  function openEdit(challenge) {
    setEditing({ ...challenge, courseId: challenge.courseId ? String(challenge.courseId) : NO_COURSE })
    setSheetOpen(true)
  }

  function handleDelete(challenge) {
    if (!confirm(`Hapus tantangan "${challenge.title}"?`)) return
    run(() => api(`/admin/challenges/${challenge.id}`, { method: 'DELETE' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const payload = {
      title: formData.get('title').trim(),
      description: formData.get('description').trim(),
      rewardPoints: Number(formData.get('rewardPoints')),
      startsAt: formData.get('startsAt'),
      endsAt: formData.get('endsAt'),
      courseId: editing.courseId === NO_COURSE ? null : Number(editing.courseId),
    }
    if (!payload.title) return

    const request = editing.id
      ? api(`/admin/challenges/${editing.id}`, { method: 'PATCH', body: payload })
      : api('/admin/challenges', { method: 'POST', body: payload })
    if (await run(() => request)) setSheetOpen(false)
  }

  if (!data) return <PageState loading={loading} error={error} />

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Tantangan Mingguan</h2>
        <Button className="gap-1 rounded-xl" onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Tantangan
        </Button>
      </div>

      <ActionError message={actionError} />

      {challenges.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center">
          <p className="font-medium">Belum ada tantangan</p>
          <p className="text-sm text-muted-foreground">Tambahkan tantangan untuk memotivasi pelajar.</p>
        </div>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tantangan</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Poin</TableHead>
                <TableHead>Kelas Terkait</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {challenges.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell>
                    <p className="font-medium">{challenge.title}</p>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(challenge.startsAt)} &ndash; {formatDate(challenge.endsAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{challenge.rewardPoints}</TableCell>
                  <TableCell className="text-muted-foreground">{courseTitle(challenge.courseId)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon-sm" aria-label={`Ubah ${challenge.title}`} onClick={() => openEdit(challenge)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Hapus ${challenge.title}`}
                        onClick={() => handleDelete(challenge)}
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
        <SheetContent className="overflow-y-auto">
          {editing && (
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing.id ? 'Ubah Tantangan' : 'Tambah Tantangan'}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <label htmlFor="challenge-title" className="text-sm font-medium">
                    Judul
                  </label>
                  <Input id="challenge-title" name="title" defaultValue={editing.title} required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="challenge-description" className="text-sm font-medium">
                    Deskripsi
                  </label>
                  <textarea
                    id="challenge-description"
                    name="description"
                    defaultValue={editing.description}
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="challenge-points" className="text-sm font-medium">
                    Poin Hadiah
                  </label>
                  <Input id="challenge-points" name="rewardPoints" type="number" min="0" defaultValue={editing.rewardPoints} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="challenge-start" className="text-sm font-medium">
                      Mulai
                    </label>
                    <Input id="challenge-start" name="startsAt" type="date" defaultValue={editing.startsAt} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="challenge-end" className="text-sm font-medium">
                      Berakhir
                    </label>
                    <Input id="challenge-end" name="endsAt" type="date" defaultValue={editing.endsAt} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Kelas Terkait</label>
                  <Select
                    value={editing.courseId}
                    onValueChange={(value) => setEditing((current) => ({ ...current, courseId: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_COURSE}>Semua Kelas</SelectItem>
                      {(courses ?? []).map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

export { ChallengesContent }
