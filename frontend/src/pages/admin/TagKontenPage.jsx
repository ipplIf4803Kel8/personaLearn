import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { useAction, useFetch } from '@/lib/use-fetch'
import { ActionError, PageState } from '@/components/admin/PageState'
import { TagPicker, personalityOptions, varkOptions } from '@/components/admin/TagPicker'

// UC10 Kelola Tag Jenis Konten — tag gaya belajar & kepribadian per kelas, disimpan ke backend.
function TagKontenPage() {
  const { data, loading, error, reload } = useFetch('/admin/courses')
  const [run, actionError] = useAction(reload)
  const [editing, setEditing] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const body = { varkTags: editing.varkTags, personalityTags: editing.personalityTags }
    if (await run(() => api(`/admin/courses/${editing.id}`, { method: 'PATCH', body }))) setEditing(null)
  }

  if (!data) return <PageState loading={loading} error={error} />

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <div>
        <h2 className="text-2xl font-semibold">Tag Jenis Konten</h2>
        <p className="text-sm text-muted-foreground">Tag dipakai untuk mencocokkan kelas dengan gaya belajar dan kepribadian pelajar.</p>
      </div>

      <ActionError message={actionError} />

      {data.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center">
          <p className="font-medium">Belum ada kelas</p>
          <p className="text-sm text-muted-foreground">Tambahkan kelas dulu di menu Kelas.</p>
        </div>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kelas</TableHead>
                <TableHead>Gaya Belajar</TableHead>
                <TableHead>Kepribadian</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    <TagList tags={course.varkTags} />
                  </TableCell>
                  <TableCell>
                    <TagList tags={course.personalityTags} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon-sm" aria-label={`Ubah tag ${course.title}`} onClick={() => setEditing(course)}>
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent>
          {editing && (
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>Ubah Tag</SheetTitle>
                <p className="text-sm text-muted-foreground">{editing.title}</p>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <TagPicker
                  label="Tag Gaya Belajar"
                  options={varkOptions}
                  value={editing.varkTags}
                  onChange={(value) => setEditing((current) => ({ ...current, varkTags: value }))}
                />
                <TagPicker
                  label="Tag Kepribadian"
                  options={personalityOptions}
                  value={editing.personalityTags}
                  onChange={(value) => setEditing((current) => ({ ...current, personalityTags: value }))}
                />
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

function TagList({ tags }) {
  if (!tags.length) return <span className="text-sm text-muted-foreground">-</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline">
          {tag}
        </Badge>
      ))}
    </div>
  )
}

export { TagKontenPage }
