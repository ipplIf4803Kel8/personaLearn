'use client'
import { useMemo, useState } from 'react'
import { Pencil, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CourseThumbnail } from '@/components/pelajar/CourseCard'
import { useToast } from '@/components/pelajar/Toast'
import { kategoriDari, pelajaranKelas, useDb } from '@/data/db'
import { JENIS_TAG, KELOMPOK_MBTI, TINGKAT_KESULITAN } from '@/data/mbti'
import { FormError, PageHeader, selectClass } from '@/components/admin/AdminKit'

function tagUntuk(db, idKelas, idPelajaran = null) {
  const daftar = db.tagKonten.filter((t) => t.idKelas === idKelas && (t.idPelajaran ?? null) === idPelajaran)
  return { jenis: [...new Set(daftar.map((t) => t.jenis))], tingkatKesulitan: daftar[0]?.tingkatKesulitan ?? 'Mudah' }
}

// UC10-L01 Daftar Tag Konten, UC10-L02 Form Tag, UC10-L03 Tag Berhasil Disimpan (toast)
function TagKontenPage() {
  const { db, aksi } = useDb()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const kelas = useMemo(() => db.kelas.filter((k) => k.status !== 'disembunyikan' && k.nama.toLowerCase().includes(search.toLowerCase())), [db.kelas, search])
  const tanpaTag = db.kelas.filter((k) => k.status !== 'disembunyikan' && tagUntuk(db, k.id).jenis.length === 0).length

  function openForm(k) {
    setError('')
    setEditing({ idKelas: k.id, idPelajaran: '', ...tagUntuk(db, k.id) })
  }

  function gantiTarget(idPelajaran) {
    const id = idPelajaran ? Number(idPelajaran) : null
    setEditing((c) => ({ ...c, idPelajaran, ...tagUntuk(db, c.idKelas, id) }))
  }

  function toggleJenis(j) {
    setEditing((c) => ({ ...c, jenis: c.jenis.includes(j) ? c.jenis.filter((x) => x !== j) : [...c.jenis, j] }))
  }

  async function simpan(e) {
    e.preventDefault()
    setLoading(true)
    const r = await aksi.simpanTag({ ...editing, idPelajaran: editing.idPelajaran ? Number(editing.idPelajaran) : null })
    setLoading(false)
    if (!r.ok) return setError(r.pesan)
    setEditing(null)
    toast('Tag berhasil disimpan. Rekomendasi pelajar diperbarui.')
  }

  const kelasEdit = editing && db.kelas.find((k) => k.id === editing.idKelas)
  return (
    <div data-screen="UC10-L01" className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <PageHeader title="Tag Jenis Konten" description="Tag dipakai sistem untuk mencocokkan kelas dengan gaya belajar (MBTI) pelajar." />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KELOMPOK_MBTI.map((g) => (
          <div key={g.id} className="rounded-2xl border p-4">
            <p className="font-semibold">{g.tag}</p>
            <p className="text-xs text-muted-foreground">Cocok untuk kelompok {g.id} ({g.tipe.join(', ')})</p>
          </div>
        ))}
      </section>

      {tanpaTag > 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{tanpaTag} kelas belum punya tag, sehingga belum muncul di rekomendasi.</p>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama kelas..." className="pl-9" />
      </div>

      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kelas</TableHead>
              <TableHead>Jenis Konten</TableHead>
              <TableHead>Kesulitan</TableHead>
              <TableHead>Tag Pelajaran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kelas.map((k) => {
              const t = tagUntuk(db, k.id)
              const perPelajaran = db.tagKonten.filter((x) => x.idKelas === k.id && x.idPelajaran).length
              return (
                <TableRow key={k.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CourseThumbnail kelas={k} className="size-10 shrink-0 rounded-lg text-lg" />
                      <div>
                        <p className="font-medium">{k.nama}</p>
                        <p className="text-xs text-muted-foreground">{kategoriDari(db, k.idKategori)?.nama}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {t.jenis.length ? t.jenis.map((j) => <Badge key={j} variant="secondary">{j}</Badge>) : <span className="text-sm text-muted-foreground">Belum ada</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.jenis.length ? t.tingkatKesulitan : '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{perPelajaran}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => openForm(k)}>
                      <Pencil className="size-4" /> Atur Tag
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="overflow-y-auto" data-screen="UC10-L02">
          {editing && (
            <form onSubmit={simpan} noValidate className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>Atur Tag: {kelasEdit?.nama}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 space-y-5 px-4">
                <FormError>{error}</FormError>
                <div className="space-y-1.5">
                  <label htmlFor="tag-target" className="text-sm font-medium">
                    Berlaku untuk
                  </label>
                  <select id="tag-target" value={editing.idPelajaran} onChange={(e) => gantiTarget(e.target.value)} className={selectClass}>
                    <option value="">Seluruh kelas</option>
                    {pelajaranKelas(db, editing.idKelas).map((p) => (
                      <option key={p.id} value={p.id}>
                        Pelajaran: {p.judul}
                      </option>
                    ))}
                  </select>
                </div>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">Jenis konten * (boleh lebih dari satu)</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {JENIS_TAG.map((j) => (
                      <button
                        type="button"
                        key={j}
                        aria-pressed={editing.jenis.includes(j)}
                        onClick={() => toggleJenis(j)}
                        className={`rounded-xl border px-3 py-2 text-sm font-medium ${editing.jenis.includes(j) ? 'border-primary bg-primary/10 text-primary' : ''}`}
                      >
                        {j}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">Tingkat kesulitan</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {TINGKAT_KESULITAN.map((t) => (
                      <button
                        type="button"
                        key={t}
                        aria-pressed={editing.tingkatKesulitan === t}
                        onClick={() => setEditing((c) => ({ ...c, tingkatKesulitan: t }))}
                        className={`rounded-xl border px-3 py-2 text-sm font-medium ${editing.tingkatKesulitan === t ? 'border-primary bg-primary/10 text-primary' : ''}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
              <SheetFooter>
                <Button type="submit" disabled={loading}>
                  Simpan Tag
                </Button>
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

export { TagKontenPage }
