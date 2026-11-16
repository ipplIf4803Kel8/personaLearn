import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { validateCourse } from '@/lib/adminValidation'
import { useFetch } from '@/lib/use-fetch'
import { useAdminAction } from '@/components/admin/useAdminAction'
import { ActionError, FieldError, PageState, STICKY_ACTION } from '@/components/admin/PageState'

import { useRouter } from '@/lib/router'
import { matchesQuery, useAdminNavigation } from '@/components/admin/AdminNavigation'
import { TagPicker, personalityGroups, varkOptions } from '@/components/admin/TagPicker'

const levels = ['Beginner', 'Intermediate', 'Advanced']

// UC8 Kelola Kelas
function KelasPage() {
  const { data, loading, error, reload } = useFetch('/admin/courses')
  const { data: categoryData } = useFetch('/admin/categories')
  const [run, actionError, clearError] = useAdminAction(reload)
  const courses = data ?? []
  const categories = categoryData ?? []
  const { navigate } = useRouter()
  const { query } = useAdminNavigation()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [errors, setErrors] = useState({})

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) && matchesQuery(query, course.title, course.description)
      const matchesCategory = categoryFilter === 'all' || course.categoryId === Number(categoryFilter)
      const matchesLevel = levelFilter === 'all' || course.level === levelFilter
      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [courses, search, query, categoryFilter, levelFilter])

  function categoryName(categoryId) {
    return categories.find((category) => category.id === categoryId)?.name ?? '-'
  }

  function openCreate() {
    setErrors({})
    clearError()
    setEditing({
      id: null,
      categoryId: categories[0]?.id ?? null,
      title: '',
      description: '',
      thumbnailUrl: '',
      level: 'Beginner',
      isPublished: false,
      varkTags: [],
      personalityTags: [],
    })
    setSheetOpen(true)
  }

  function openEdit(course) {
    setErrors({})
    clearError()
    setEditing(course)
    setSheetOpen(true)
  }

  function handleDelete(course) {
    if (!confirm(`Hapus kelas "${course.title}" beserta seluruh pelajarannya?`)) return
    run(() => api(`/admin/courses/${course.id}`, { method: 'DELETE' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const payload = {
      title: formData.get('title').trim(),
      description: formData.get('description').trim(),
      thumbnailUrl: formData.get('thumbnailUrl').trim() || null,
      categoryId: editing.categoryId,
      level: editing.level,
      isPublished: editing.isPublished,
      varkTags: editing.varkTags,
      personalityTags: editing.personalityTags,
    }
    const { coverUrl, ...rest } = validateCourse({ ...payload, coverUrl: payload.thumbnailUrl })
    const found = coverUrl ? { ...rest, thumbnailUrl: coverUrl } : rest
    setErrors(found)
    if (Object.keys(found).length) return

    const request = editing.id
      ? api(`/admin/courses/${editing.id}`, { method: 'PATCH', body: payload })
      : api('/admin/courses', { method: 'POST', body: payload })
    if (await run(() => request)) setSheetOpen(false)
  }

  if (!data) return <PageState loading={loading} error={error} />

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Kelas</h2>
        <Button className="gap-1 rounded-xl" onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Kelas
        </Button>
      </div>

      <ActionError message={sheetOpen ? null : actionError} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari judul kelas..."
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Level</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center">
          <p className="font-medium">Tidak ada kelas yang cocok</p>
          <p className="text-sm text-muted-foreground">Ubah kata kunci pencarian atau filter.</p>
        </div>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kelas</TableHead>
                <TableHead>Kategori / Level</TableHead>
                <TableHead className="hidden md:table-cell">Pelajar</TableHead>
                <TableHead className="hidden md:table-cell">Rating</TableHead>
                <TableHead className={`text-right ${STICKY_ACTION}`}>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{course.title}</p>
                        <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                          {course.isPublished ? 'Terbit' : 'Draf'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[...course.varkTags, ...course.personalityTags].map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-normal text-muted-foreground">
                    {categoryName(course.categoryId)} &middot; {course.level}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{course.studentsCount}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{course.rating ?? '-'}</TableCell>
                  <TableCell className={`text-right ${STICKY_ACTION}`}>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/kelas/${course.id}`)}>
                        Kelola Pelajaran
                      </Button>
                      <Button variant="outline" size="icon-sm" aria-label={`Ubah ${course.title}`} onClick={() => openEdit(course)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Hapus ${course.title}`}
                        onClick={() => handleDelete(course)}
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
            <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing.id ? 'Ubah Kelas' : 'Tambah Kelas'}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <label htmlFor="course-title" className="block text-sm font-medium">
                    Judul
                  </label>
                  <Input id="course-title" name="title" defaultValue={editing.title} aria-invalid={!!errors.title} />
                  <FieldError message={errors.title} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="course-description" className="block text-sm font-medium">
                    Deskripsi
                  </label>
                  <textarea
                    id="course-description"
                    name="description"
                    defaultValue={editing.description}
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="course-thumbnail" className="block text-sm font-medium">
                    URL Sampul
                  </label>
                  <Input
                    id="course-thumbnail"
                    name="thumbnailUrl"
                    defaultValue={editing.thumbnailUrl ?? ''}
                    placeholder="https://..."
                    aria-invalid={!!errors.thumbnailUrl}
                  />
                  <FieldError message={errors.thumbnailUrl} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium">Kategori</label>
                    <Select
                      value={editing.categoryId ? String(editing.categoryId) : ''}
                      onValueChange={(value) => setEditing((current) => ({ ...current, categoryId: Number(value) }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.categoryId} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium">Level</label>
                    <Select
                      value={editing.level}
                      onValueChange={(value) => setEditing((current) => ({ ...current, level: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.level} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={editing.isPublished}
                    onChange={(event) => setEditing((current) => ({ ...current, isPublished: event.target.checked }))}
                  />
                  Terbitkan kelas
                </label>
                <TagPicker
                  label="Tag Gaya Belajar"
                  options={varkOptions}
                  value={editing.varkTags}
                  onChange={(value) => setEditing((current) => ({ ...current, varkTags: value }))}
                />
                <TagPicker
                  label="Tag Kepribadian"
                  groups={personalityGroups}
                  value={editing.personalityTags}
                  onChange={(value) => setEditing((current) => ({ ...current, personalityTags: value }))}
                />
              </div>
              <ActionError message={actionError} className="px-4" />
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

export { KelasPage }
