'use client'
import { useMemo, useRef, useState } from 'react'
import { Eye, ImagePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CourseThumbnail } from '@/components/pelajar/CourseCard'
import { useToast } from '@/components/pelajar/Toast'
import { jumlahPelajar, kategoriDari, pelajaranKelas, useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { ConfirmDialog, FormError, PageHeader, CLASS_STATUS, selectClass, textareaClass } from '@/components/admin/AdminKit'

const TINGKAT = ['Pemula', 'Menengah', 'Lanjut']

// UC8-L01 Daftar Kelas + UC8-L02 Form Kelas

export function KelasPage() {
  const { navigate } = useRouter()
  const { db, aksi } = useDb()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('semua')
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hapus, setHapus] = useState(null)
  const fileRef = useRef(null)

  const filtered = useMemo(
    () =>
      db.kelas.filter(
        (k) =>
          k.nama.toLowerCase().includes(search.toLowerCase()) && (kategori === 'semua' || k.idKategori === Number(kategori)),
      ),
    [db.kelas, search, kategori],
  )


  function openForm(kelas) {
    setError('')
    setEditing(kelas ?? { id: null, nama: '', idKategori: db.kategori[0]?.id ?? '', tingkat: 'Pemula', deskripsi: '', gambar: null })
  }

  function pilihGambar(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!['image/jpeg', 'image/png'].includes(f.type) || f.size > 5 * 1024 * 1024) {
      return setError('Gambar tidak valid. Gunakan JPG atau PNG maksimal 5 MB.')
    }
    setError('')
    const r = new FileReader()
    r.onload = () => setEditing((c) => ({ ...c, gambar: r.result }))
    r.readAsDataURL(f)
  }

  async function simpan(status) {
    setLoading(true)
    const r = await aksi.simpanKelas({ ...editing, idKategori: Number(editing.idKategori) }, status)
    setLoading(false)
    if (!r.ok) return setError(r.pesan)
    setEditing(null)
    toast(status === 'terbit' ? 'Kelas berhasil dipublikasikan' : 'Kelas berhasil disimpan sebagai draf')
  }

  async function konfirmasiHapus() {
    setLoading(true)
    const r = await aksi.hapusKelas(hapus.id)
    setLoading(false)
    setHapus(null)
    toast(r.disembunyikan ? 'Kelas sudah diikuti pelajar, jadi hanya disembunyikan' : 'Kelas dihapus')
  }

  return (
    <div data-screen="UC8-L01" className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <PageHeader title="Kelas" description="Kelola kelas, status publikasi, dan pelajarannya.">
        <Button className="gap-1 rounded-xl" onClick={() => openForm()}>
          <Plus className="size-4" />
          Tambah Kelas
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama kelas..." className="pl-9" />
        </div>
        <select aria-label="Filter kategori" value={kategori} onChange={(e) => setKategori(e.target.value)} className={`${selectClass} sm:w-56`}>
          <option value="semua">Semua Kategori</option>
          {db.kategori.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
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
                <TableHead>Kategori</TableHead>
                <TableHead>Tingkat</TableHead>
                <TableHead>Pelajaran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((k) => (
                <TableRow key={k.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CourseThumbnail kelas={k} className="size-11 shrink-0 rounded-lg text-xl" />
                      <p className="font-medium">{k.nama}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{kategoriDari(db, k.idKategori)?.nama ?? '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{k.tingkat}</TableCell>
                  <TableCell className="text-muted-foreground">{pelajaranKelas(db, k.id).length}</TableCell>
                  <TableCell>
                    <Badge variant={CLASS_STATUS[k.status].variant}>{CLASS_STATUS[k.status].label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/admin/kelas/${k.id}`)}>
                        <Eye className="size-4" /> Detail
                      </Button>
                      <Button variant="outline" size="icon-sm" aria-label={`Ubah ${k.nama}`} onClick={() => openForm(k)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon-sm" aria-label={`Hapus ${k.nama}`} onClick={() => setHapus(k)}>
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

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="overflow-y-auto" data-screen="UC8-L02">
          {editing && (
            <form onSubmit={(e) => e.preventDefault()} noValidate className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing.id ? 'Ubah Kelas' : 'Tambah Kelas'}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <FormError>{error}</FormError>
                <div className="space-y-1.5">
                  <label htmlFor="kelas-nama" className="text-sm font-medium">
                    Nama kelas *
                  </label>
                  <Input id="kelas-nama" value={editing.nama} onChange={(e) => setEditing((c) => ({ ...c, nama: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="kelas-kategori" className="text-sm font-medium">
                      Kategori *
                    </label>
                    <select id="kelas-kategori" value={editing.idKategori} onChange={(e) => setEditing((c) => ({ ...c, idKategori: e.target.value }))} className={selectClass}>
                      <option value="">Pilih kategori</option>
                      {db.kategori.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="kelas-tingkat" className="text-sm font-medium">
                      Tingkat
                    </label>
                    <select id="kelas-tingkat" value={editing.tingkat} onChange={(e) => setEditing((c) => ({ ...c, tingkat: e.target.value }))} className={selectClass}>
                      {TINGKAT.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="kelas-deskripsi" className="text-sm font-medium">
                    Deskripsi
                  </label>
                  <textarea id="kelas-deskripsi" rows={4} value={editing.deskripsi} onChange={(e) => setEditing((c) => ({ ...c, deskripsi: e.target.value }))} className={textareaClass} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Gambar sampul</p>
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    {editing.gambar ? <img src={editing.gambar} alt="Pratinjau sampul" className="h-32 w-full rounded-lg object-cover" /> : <ImagePlus className="size-6" />}
                    Unggah JPG atau PNG, maksimal 5 MB
                  </button>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png" hidden onChange={pilihGambar} />
                </div>
              </div>
              <SheetFooter>
                <Button type="button" disabled={loading} onClick={() => simpan('terbit')}>
                  Publikasikan
                </Button>
                <Button type="button" variant="secondary" disabled={loading} onClick={() => simpan('draf')}>
                  Simpan sebagai Draf
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

      <ConfirmDialog
        open={!!hapus}
        title={`Hapus kelas "${hapus?.nama}"?`}
        description="Pelajaran dan tag di dalam kelas ini ikut terhapus."
        warning={hapus && jumlahPelajar(db, hapus.id) > 0 ? 'Kelas ini sudah diikuti pelajar. Kelas hanya akan disembunyikan agar progres pelajar tidak hilang.' : null}
        loading={loading}
        onCancel={() => setHapus(null)}
        onConfirm={konfirmasiHapus}
      />
    </div>
  )
}
