import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { validateCategory } from '@/lib/adminValidation'
import { useFetch } from '@/lib/use-fetch'
import { useAdminAction } from '@/components/admin/useAdminAction'
import { ActionError, FieldError, PageState, STICKY_ACTION } from '@/components/admin/PageState'
import { matchesQuery, useAdminNavigation } from '@/components/admin/AdminNavigation'

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// UC7 Kelola Kategori
function KategoriPage() {
  const { data, loading, error, reload } = useFetch('/admin/categories')
  const [run, actionError, clearError] = useAdminAction(reload)
  const { query } = useAdminNavigation()
  const categories = (data ?? []).filter((c) => matchesQuery(query, c.name, c.slug))
  const [editing, setEditing] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [deleting, setDeleting] = useState(null)

  function openCreate() {
    setErrors({})
    clearError()
    setEditing({ id: null, name: '', slug: '' })
    setSheetOpen(true)
  }

  function openEdit(category) {
    setErrors({})
    clearError()
    setEditing(category)
    setSheetOpen(true)
  }

  function openDelete(category) {
    clearError()
    setDeleting(category)
  }

  async function confirmDelete() {
    if (await run(() => api(`/admin/categories/${deleting.id}`, { method: 'DELETE' }))) setDeleting(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name').trim()
    const rawSlug = formData.get('slug').trim()
    const found = validateCategory({ name, slug: rawSlug })
    setErrors(found)
    if (Object.keys(found).length) return
    const slug = rawSlug || slugify(name)

    const request = editing.id
      ? api(`/admin/categories/${editing.id}`, { method: 'PATCH', body: { name, slug } })
      : api('/admin/categories', { method: 'POST', body: { name, slug } })
    if (await run(() => request)) setSheetOpen(false)
  }

  const slugConflict = /slug/i.test(actionError ?? '')

  if (!data) return <PageState loading={loading} error={error} />

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Kategori Kelas</h2>
        <Button className="gap-1 rounded-xl" onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Kategori
        </Button>
      </div>

      <ActionError message={sheetOpen || deleting ? null : actionError} />

      {categories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className={`text-right ${STICKY_ACTION}`}>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className={`text-right ${STICKY_ACTION}`}>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon-sm" aria-label={`Ubah ${category.name}`} onClick={() => openEdit(category)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Hapus ${category.name}`}
                        onClick={() => openDelete(category)}
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
          <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>{editing?.id ? 'Ubah Kategori' : 'Tambah Kategori'}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 space-y-4 px-4">
              <div className="space-y-1.5">
                <label htmlFor="category-name" className="block text-sm font-medium">
                  Nama
                </label>
                <Input id="category-name" name="name" defaultValue={editing?.name} aria-invalid={!!errors.name} />
                <FieldError message={errors.name} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="category-slug" className="block text-sm font-medium">
                  Slug
                </label>
                <Input id="category-slug" name="slug" defaultValue={editing?.slug} placeholder="dibuat otomatis dari nama" aria-invalid={!!errors.slug} />
                <FieldError message={errors.slug ?? (slugConflict ? actionError : null)} />
              </div>
            </div>
            <ActionError message={slugConflict ? null : actionError} className="px-4" />
            <SheetFooter>
              <Button type="submit">Simpan</Button>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Hapus Kategori</SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-4 px-4">
            <p className="text-sm">Hapus kategori "{deleting?.name}"?</p>
            <ActionError message={actionError} />
          </div>
          <SheetFooter>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center">
      <p className="font-medium">Belum ada kategori</p>
      <p className="text-sm text-muted-foreground">Tambahkan kategori pertama untuk mengelompokkan kelas.</p>
    </div>
  )
}

export { KategoriPage }
