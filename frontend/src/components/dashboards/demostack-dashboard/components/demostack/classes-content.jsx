'use client'
import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from 'lucide-react'
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
import { categories, courses as initialCourses, lessonsByCourse as initialLessonsByCourse } from '../../data'

const levels = ['Beginner', 'Intermediate', 'Advanced']
const varkOptions = ['visual', 'auditory', 'reading', 'kinesthetic']
const personalityOptions = ['exploratory', 'structured', 'collaborative', 'self-paced']

function formatDuration(seconds) {
  const minutes = Math.round(seconds / 60)
  return `${minutes} menit`
}

function toggleTag(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function TagPicker({ label, options, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => onChange(toggleTag(value, option))}
            className={`rounded-full border px-3 py-1 text-xs ${
              value.includes(option) ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function ClassesContent() {
  const [courses, setCourses] = useState(initialCourses)
  const [lessonsByCourse, setLessonsByCourse] = useState(initialLessonsByCourse)
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || course.categoryId === Number(categoryFilter)
      const matchesLevel = levelFilter === 'all' || course.level === levelFilter
      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [courses, search, categoryFilter, levelFilter])

  function categoryName(categoryId) {
    return categories.find((category) => category.id === categoryId)?.name ?? '-'
  }

  function openCreate() {
    setEditing({
      id: null,
      categoryId: categories[0]?.id ?? null,
      title: '',
      description: '',
      level: 'Beginner',
      isPublished: false,
      varkTags: [],
      personalityTags: [],
    })
    setSheetOpen(true)
  }

  function openEdit(course) {
    setEditing(course)
    setSheetOpen(true)
  }

  function handleDelete(id) {
    setCourses((current) => current.filter((course) => course.id !== id))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const payload = {
      title: formData.get('title').trim(),
      description: formData.get('description').trim(),
      categoryId: editing.categoryId,
      level: editing.level,
      isPublished: editing.isPublished,
      varkTags: editing.varkTags,
      personalityTags: editing.personalityTags,
    }
    if (!payload.title) return

    if (editing.id) {
      setCourses((current) => current.map((course) => (course.id === editing.id ? { ...course, ...payload } : course)))
    } else {
      const nextId = Math.max(0, ...courses.map((course) => course.id)) + 1
      setCourses((current) => [
        ...current,
        { ...payload, id: nextId, thumbnailUrl: '', studentsCount: 0, rating: 0 },
      ])
      setLessonsByCourse((current) => ({ ...current, [nextId]: [] }))
    }
    setSheetOpen(false)
  }

  if (selectedCourseId) {
    const course = courses.find((item) => item.id === selectedCourseId)
    return (
      <LessonsPanel
        course={course}
        lessons={lessonsByCourse[selectedCourseId] ?? []}
        onBack={() => setSelectedCourseId(null)}
        onChangeLessons={(lessons) =>
          setLessonsByCourse((current) => ({ ...current, [selectedCourseId]: lessons }))
        }
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Kelas</h2>
        <Button className="gap-1 rounded-xl" onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Kelas
        </Button>
      </div>

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
                <TableHead>Pelajar</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
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
                  <TableCell className="text-muted-foreground">
                    {categoryName(course.categoryId)} &middot; {course.level}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{course.studentsCount}</TableCell>
                  <TableCell className="text-muted-foreground">{course.rating}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedCourseId(course.id)}>
                        Kelola Pelajaran
                      </Button>
                      <Button variant="outline" size="icon-sm" aria-label={`Ubah ${course.title}`} onClick={() => openEdit(course)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Hapus ${course.title}`}
                        onClick={() => handleDelete(course.id)}
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
                <SheetTitle>{editing.id ? 'Ubah Kelas' : 'Tambah Kelas'}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <label htmlFor="course-title" className="text-sm font-medium">
                    Judul
                  </label>
                  <Input id="course-title" name="title" defaultValue={editing.title} required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="course-description" className="text-sm font-medium">
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Kategori</label>
                    <Select
                      value={String(editing.categoryId)}
                      onValueChange={(value) => setEditing((current) => ({ ...current, categoryId: Number(value) }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Level</label>
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

function LessonsPanel({ course, lessons, onBack, onChangeLessons }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const sortedLessons = [...lessons].sort((a, b) => a.position - b.position)

  function openCreate() {
    setEditing({ id: null, title: '', videoUrl: '', durationMinutes: '', description: '' })
    setSheetOpen(true)
  }

  function openEdit(lesson) {
    setEditing({ ...lesson, durationMinutes: Math.round(lesson.durationSeconds / 60) })
    setSheetOpen(true)
  }

  function handleDelete(id) {
    onChangeLessons(lessons.filter((lesson) => lesson.id !== id))
  }

  function move(id, direction) {
    const index = sortedLessons.findIndex((lesson) => lesson.id === id)
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= sortedLessons.length) return
    const reordered = [...sortedLessons]
    ;[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]]
    onChangeLessons(reordered.map((lesson, position) => ({ ...lesson, position: position + 1 })))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = formData.get('title').trim()
    const videoUrl = formData.get('videoUrl').trim()
    const durationSeconds = Math.max(0, Number(formData.get('durationMinutes')) * 60)
    const description = formData.get('description').trim()
    if (!title) return

    if (editing.id) {
      onChangeLessons(
        lessons.map((lesson) => (lesson.id === editing.id ? { ...lesson, title, videoUrl, durationSeconds, description } : lesson))
      )
    } else {
      const nextId = Math.max(0, ...lessons.map((lesson) => lesson.id)) + 1
      onChangeLessons([
        ...lessons,
        { id: nextId, title, videoUrl, durationSeconds, description, position: lessons.length + 1 },
      ])
    }
    setSheetOpen(false)
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

      {sortedLessons.length === 0 ? (
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
                        onClick={() => handleDelete(lesson.id)}
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

export { ClassesContent }
