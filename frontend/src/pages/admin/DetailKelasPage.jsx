'use client'
import { useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CourseThumbnail } from '@/components/pelajar/CourseCard'
import { useToast } from '@/components/pelajar/Toast'
import { durasiKelas, kategoriDari, pelajaranKelas, useDb } from '@/data/db'
import { useParams } from 'react-router'
import { useRouter } from '@/lib/router'
import { ConfirmDialog, FormError, PageHeader, CLASS_STATUS, textareaClass } from '@/components/admin/AdminKit'

// UC9-L01 Detail Kelas, UC9-L02 Form Pelajaran, UC9-L03 Pelajaran Berhasil Disimpan, UC9-L04 Konfirmasi Hapus Pelajaran
export function DetailKelasPage() {
  const { navigate } = useRouter()
  const idKelas = Number(useParams().id)
  const onBack = () => navigate('/admin/kelas')
  const { db, aksi } = useDb()
  const toast = useToast()
  const kelas = db.kelas.find((k) => k.id === idKelas)
  const tersimpan = pelajaranKelas(db, idKelas)
  const [urutan, setUrutan] = useState(null)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [unggah, setUnggah] = useState({ status: 'idle', progres: 0, nama: '' })
  const [hapus, setHapus] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)

  if (!kelas)
    return (
      <div className="mx-auto max-w-6xl p-8">
        <Button variant="ghost" onClick={onBack}>
          Kembali
        </Button>
        <p className="mt-4">Kelas tidak ditemukan.</p>
      </div>
    )

  const daftar = urutan ? urutan.map((id) => tersimpan.find((p) => p.id === id)).filter(Boolean) : tersimpan

  function geser(index, arah) {
    const ids = daftar.map((p) => p.id)
    const tujuan = index + arah
    if (tujuan < 0 || tujuan >= ids.length) return
    ;[ids[index], ids[tujuan]] = [ids[tujuan], ids[index]]
    setUrutan(ids)
  }

  async function simpanUrutan() {
    await aksi.simpanUrutan(idKelas, urutan)
    setUrutan(null)
    toast('Urutan pelajaran berhasil disimpan')
  }

  function openForm(p) {
    setError('')
    setUnggah({ status: p ? 'selesai' : 'idle', progres: p ? 100 : 0, nama: p ? 'Video tersimpan' : '' })
    setEditing(p ?? { id: null, idKelas, judul: '', urlVideo: '', durasi: '', deskripsi: '' })
  }

  async function mulaiUnggah(file) {
    setError('')
    setUnggah({ status: 'mengunggah', progres: 0, nama: file.name })
    const timer = setInterval(() => setUnggah((u) => ({ ...u, progres: Math.min(90, u.progres + 15) })), 120)
    try {
      const r = await aksi.unggahVideo(file)
      clearInterval(timer)
      setUnggah({ status: 'selesai', progres: 100, nama: file.name })
      setEditing((c) => ({ ...c, urlVideo: r.url, _file: file }))
    } catch {
      clearInterval(timer)
      setUnggah({ status: 'gagal', progres: 0, nama: file.name, file })
    }
  }

  async function simpan(e) {
    e.preventDefault()
    setLoading(true)
    const { _file, ...data } = editing
    const r = await aksi.simpanPelajaran({ ...data, durasi: Number(data.durasi) || 0 })
    setLoading(false)
    if (!r.ok) return setError(r.pesan)
    setEditing(null)
    toast('Pelajaran berhasil disimpan')
  }

  async function konfirmasiHapus() {
    setLoading(true)
    await aksi.hapusPelajaran(hapus.id)
    setLoading(false)
    setHapus(null)
    toast('Pelajaran dihapus')
  }

  const kat = kategoriDari(db, kelas.idKategori)
  return (
    <div data-screen="UC9-L01" className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <Button variant="ghost" size="sm" className="gap-1 px-0" onClick={onBack}>
        <ArrowLeft className="size-4" />
        Kembali ke Daftar Kelas
      </Button>

      <div className="flex flex-col gap-5 rounded-2xl border p-5 sm:flex-row">
        <CourseThumbnail kelas={kelas} className="h-32 w-full shrink-0 rounded-xl text-5xl sm:w-48" />
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold">{kelas.nama}</h2>
            <Badge variant={CLASS_STATUS[kelas.status].variant}>{CLASS_STATUS[kelas.status].label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{kelas.deskripsi}</p>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              ['Kategori', kat?.nama ?? '-'],
              ['Tingkat', kelas.tingkat],
              ['Jumlah pelajaran', tersimpan.length],
              ['Durasi', `${durasiKelas(db, idKelas)} menit`],
            ].map(([l, v]) => (
              <div key={l}>
                <dt className="text-muted-foreground">{l}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <PageHeader title="Pelajaran" description="Urutan di bawah ini yang tampil di Konten Kelas aplikasi pelajar.">
        <div className="flex gap-2">
          {urutan && (
            <Button variant="secondary" className="rounded-xl" onClick={simpanUrutan}>
              Simpan urutan
            </Button>
          )}
          <Button className="gap-1 rounded-xl" onClick={() => openForm()}>
            <Plus className="size-4" />
            Tambah Pelajaran
          </Button>
        </div>
      </PageHeader>

      {daftar.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center">
          <p className="font-medium">Belum ada pelajaran</p>
          <p className="text-sm text-muted-foreground">Tambahkan pelajaran pertama agar kelas bisa dipublikasikan.</p>
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
              {daftar.map((p, i) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{p.judul}</TableCell>
                  <TableCell className="text-muted-foreground">{p.durasi} menit</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="icon-sm" aria-label="Naikkan urutan" onClick={() => geser(i, -1)}>
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon-sm" aria-label="Turunkan urutan" onClick={() => geser(i, 1)}>
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon-sm" aria-label={`Ubah ${p.judul}`} onClick={() => openForm(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon-sm" aria-label={`Hapus ${p.judul}`} onClick={() => setHapus(p)}>
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
        <SheetContent className="overflow-y-auto" data-screen="UC9-L02">
          {editing && (
            <form onSubmit={simpan} noValidate className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing.id ? 'Ubah Pelajaran' : 'Tambah Pelajaran'}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <FormError>{error}</FormError>
                <div className="space-y-1.5">
                  <label htmlFor="pel-judul" className="text-sm font-medium">
                    Judul *
                  </label>
                  <Input id="pel-judul" value={editing.judul} onChange={(e) => setEditing((c) => ({ ...c, judul: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Video *</p>
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    <Upload className="size-5" /> {unggah.nama || 'Pilih file video'}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      e.target.value = ''
                      if (f) mulaiUnggah(f)
                    }}
                  />
                  {unggah.status !== 'idle' && (
                    <div className="space-y-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className={`h-full rounded-full ${unggah.status === 'gagal' ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${unggah.status === 'gagal' ? 100 : unggah.progres}%` }} />
                      </div>
                      {unggah.status === 'gagal' ? (
                        <p className="flex items-center justify-between text-sm text-destructive">
                          Video gagal diunggah. Periksa koneksi, lalu coba lagi.
                          <button type="button" className="font-semibold underline" onClick={() => mulaiUnggah(unggah.file)}>
                            Coba lagi
                          </button>
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">{unggah.status === 'selesai' ? 'Unggahan selesai' : `Mengunggah ${unggah.progres}%`}</p>
                      )}
                    </div>
                  )}
                  <Input placeholder="atau tempel URL video (https://...)" value={editing._file ? '' : editing.urlVideo} onChange={(e) => setEditing((c) => ({ ...c, urlVideo: e.target.value, _file: null }))} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="pel-durasi" className="text-sm font-medium">
                    Durasi (menit)
                  </label>
                  <Input id="pel-durasi" type="number" min="0" value={editing.durasi} onChange={(e) => setEditing((c) => ({ ...c, durasi: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="pel-deskripsi" className="text-sm font-medium">
                    Deskripsi
                  </label>
                  <textarea id="pel-deskripsi" rows={3} value={editing.deskripsi} onChange={(e) => setEditing((c) => ({ ...c, deskripsi: e.target.value }))} className={textareaClass} />
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" disabled={loading || unggah.status === 'mengunggah'}>
                  Simpan
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
        screen="UC9-L04"
        open={!!hapus}
        title={`Hapus pelajaran "${hapus?.judul}"?`}
        description="Pelajaran akan dihapus dari kelas dan jumlah pelajaran diperbarui."
        warning={hapus && aksi.sudahDitonton(hapus.id) ? 'Pelajaran ini sudah ditonton pelajar. Progres pelajar akan dihitung ulang.' : null}
        loading={loading}
        onCancel={() => setHapus(null)}
        onConfirm={konfirmasiHapus}
      />
    </div>
  )
}
