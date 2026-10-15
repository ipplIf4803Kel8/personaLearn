'use client'
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
import { categories as initialCategories } from '../../data'

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function CategoriesContent() {
  const [categories, setCategories] = useState(initialCategories)
  const [editing, setEditing] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  function openCreate() {
    setEditing({ id: null, name: '', slug: '' })
    setSheetOpen(true)
  }

  function openEdit(category) {
    setEditing(category)
    setSheetOpen(true)
  }

  function handleDelete(id) {
    setCategories((current) => current.filter((category) => category.id !== id))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name').trim()
    const slug = formData.get('slug').trim() || slugify(name)

    if (!name) return

    if (editing.id) {
      setCategories((current) =>
        current.map((category) => (category.id === editing.id ? { ...category, name, slug } : category))
      )
    } else {
      const nextId = Math.max(0, ...categories.map((category) => category.id)) + 1
      setCategories((current) => [...current, { id: nextId, name, slug }])
    }
    setSheetOpen(false)
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Kategori Kelas</h2>
        <Button className="gap-1 rounded-xl" onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Kategori
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon-sm" aria-label={`Ubah ${category.name}`} onClick={() => openEdit(category)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Hapus ${category.name}`}
                        onClick={() => handleDelete(category.id)}
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
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>{editing?.id ? 'Ubah Kategori' : 'Tambah Kategori'}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 space-y-4 px-4">
              <div className="space-y-1.5">
                <label htmlFor="category-name" className="text-sm font-medium">
                  Nama
                </label>
                <Input id="category-name" name="name" defaultValue={editing?.name} required />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="category-slug" className="text-sm font-medium">
                  Slug
                </label>
                <Input id="category-slug" name="slug" defaultValue={editing?.slug} placeholder="dibuat otomatis dari nama" />
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

export { CategoriesContent }
