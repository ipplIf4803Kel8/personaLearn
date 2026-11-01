'use client'
import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/pelajar/Toast'
import { useDb } from '@/data/db'
import { ConfirmDialog, FormError, PageHeader } from '@/components/admin/AdminKit'

const IKON = ['📖', '🎨', '💻', '🗣️', '📈', '🧪', '🧮', '🎵', '📷', '🌏']

// UC7-L01 Daftar Kategori, UC7-L02 Form Kategori, UC7-L03 Konfirmasi Hapus, UC7-L04 Kategori Berhasil Disimpan
function KategoriPage() {
  const { db, aksi } = useDb()
  const toast = useToast()
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [hapus, setHapus] = useState(null)
  const [hapusError, setHapusError] = useState('')
  const [loading, setLoading] = useState(false)

  const jumlahKelas = (id) => db.kelas.filter((k) => k.idKategori === id).length

  function openForm(kategori) {
    setError('')
    setEditing(kategori ?? { id: null, nama: '', ikon: IKON[0] })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    const r = await aksi.simpanKategori(editing)
    setLoading(false)
    if (!r.ok) return setError(r.pesan)
    setEditing(null)
    toast('Kategori berhasil disimpan')
  }

  async function konfirmasiHapus() {
    setLoading(true)
    const r = await aksi.hapusKategori(hapus.id)
    setLoading(false)
    if (!r.ok) {
      setHapus(null)
      return setHapusError(r.pesan)
    }
    setHapus(null)
    toast('Kategori dihapus')
  }

  return (
    <div data-screen="UC7-L01" className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <PageHeader title="Kategori Kelas" description="Kelompokkan kelas agar mudah dicari pelajar.">
        <Button className="gap-1 rounded-xl" onClick={() => openForm()}>
          <Plus className="size-4" />
          Tambah Kategori
        </Button>
      </PageHeader>

      <section className="grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="rounded-2xl border p-5">
          <p className="text-2xl font-semibold">{db.kategori.length}</p>
          <p className="text-sm text-muted-foreground">Total kategori</p>
        </div>
        <div className="rounded-2xl border p-5">
          <p className="text-2xl font-semibold">{db.kelas.length}</p>
          <p className="text-sm text-muted-foreground">Total kelas</p>
        </div>
      </section>

      <FormError>{hapusError}</FormError>

      {db.kategori.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center">
          <p className="font-medium">Belum ada kategori</p>
          <p className="text-sm text-muted-foreground">Tambahkan kategori pertama untuk mengelompokkan kelas.</p>
        </div>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ikon</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jumlah Kelas</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {db.kategori.map((kategori) => (
                <TableRow key={kategori.id}>
                  <TableCell className="text-2xl">{kategori.ikon}</TableCell>
                  <TableCell className="font-medium">{kategori.nama}</TableCell>
                  <TableCell className="text-muted-foreground">{jumlahKelas(kategori.id)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon-sm" aria-label={`Ubah ${kategori.nama}`} onClick={() => openForm(kategori)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Hapus ${kategori.nama}`}
                        onClick={() => {
                          setHapusError('')
                          setHapus(kategori)
                        }}
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

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent data-screen="UC7-L02">
          {editing && (
            <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing.id ? 'Ubah Kategori' : 'Tambah Kategori'}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <FormError>{error}</FormError>
                <div className="space-y-1.5">
                  <label htmlFor="category-name" className="text-sm font-medium">
                    Nama kategori
                  </label>
                  <Input
                    id="category-name"
                    value={editing.nama}
                    aria-invalid={!!error}
                    onChange={(e) => setEditing((c) => ({ ...c, nama: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Ikon</p>
                  <div className="grid grid-cols-5 gap-2">
                    {IKON.map((ikon) => (
                      <button
                        type="button"
                        key={ikon}
                        aria-pressed={editing.ikon === ikon}
                        onClick={() => setEditing((c) => ({ ...c, ikon }))}
                        className={`rounded-xl border py-2 text-2xl ${editing.ikon === ikon ? 'border-primary bg-primary/10' : ''}`}
                      >
                        {ikon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" disabled={loading}>
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
        screen="UC7-L03"
        open={!!hapus}
        title={`Hapus kategori "${hapus?.nama}"?`}
        description="Kategori yang dihapus tidak bisa dikembalikan."
        warning={hapus && jumlahKelas(hapus.id) > 0 ? `Kategori ini masih dipakai ${jumlahKelas(hapus.id)} kelas.` : null}
        loading={loading}
        onCancel={() => setHapus(null)}
        onConfirm={konfirmasiHapus}
      />
    </div>
  )
}

export { KategoriPage }
