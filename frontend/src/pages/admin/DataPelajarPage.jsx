'use client'
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDb } from '@/data/db'
import { kelompokDariTipe } from '@/data/mbti'
import { PageHeader } from '@/components/admin/AdminKit'

function inisial(nama) {
  return nama.trim().split(/\s+/).map((p) => p[0]).join('').toUpperCase().slice(0, 2)
}

function tanggal(iso) {
  return iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
}

// UC11-L01 Daftar Pelajar, UC11-L02 Detail Pelajar
function DataPelajarPage() {
  const { db } = useDb()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const pelajar = useMemo(
    () =>
      db.pengguna
        .filter((u) => u.peran === 'pelajar')
        .filter((u) => `${u.nama} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
        .map((u) => {
          const kelas = db.kelasDiikuti.filter((k) => k.idPengguna === u.id)
          const riwayat = db.riwayatBelajar.filter((r) => r.idPengguna === u.id).map((r) => r.tanggal).sort()
          return {
            ...u,
            kelas,
            rataProgres: kelas.length ? Math.round(kelas.reduce((s, k) => s + k.progres, 0) / kelas.length) : 0,
            terakhirAktif: riwayat[riwayat.length - 1] ?? null,
          }
        }),
    [db, search],
  )
  const detail = selected && pelajar.find((u) => u.id === selected)

  return (
    <div data-screen="UC11-L01" className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-7 md:py-8">
      <PageHeader title="Pelajar" description="Pantau data dan kemajuan belajar setiap pelajar." />

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau email..." className="pl-9" />
      </div>

      {pelajar.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center">
          <p className="font-medium">Pelajar tidak ditemukan</p>
          <p className="text-sm text-muted-foreground">Coba kata kunci lain.</p>
        </div>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelajar</TableHead>
                <TableHead>Tipe MBTI</TableHead>
                <TableHead>Kelas Diikuti</TableHead>
                <TableHead>Rata-rata Progres</TableHead>
                <TableHead>Terakhir Belajar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pelajar.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarImage src={u.foto ?? ''} alt={u.nama} />
                        <AvatarFallback>{inisial(u.nama)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{u.nama}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{u.tipeMbti ? <Badge variant="secondary">{u.tipeMbti}</Badge> : <span className="text-sm text-muted-foreground">Belum diisi</span>}</TableCell>
                  <TableCell className="text-muted-foreground">{u.kelas.length}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${u.rataProgres}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground">{u.rataProgres}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tanggal(u.terakhirAktif)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelected(u.id)}>
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={!!detail} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="overflow-y-auto" data-screen="UC11-L02">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>Detail Pelajar</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-6">
                <div className="flex items-center gap-3">
                  <Avatar className="size-14">
                    <AvatarImage src={detail.foto ?? ''} alt={detail.nama} />
                    <AvatarFallback>{inisial(detail.nama)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">{detail.nama}</p>
                    <p className="text-sm text-muted-foreground">{detail.email}</p>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['No. telepon', detail.noTelepon || '-'],
                    ['Bergabung', tanggal(detail.dibuatPada)],
                    ['Tipe MBTI', detail.tipeMbti ? `${detail.tipeMbti} (${kelompokDariTipe(detail.tipeMbti)?.id ?? '-'})` : 'Belum diisi'],
                    ['Poin', detail.poin],
                    ['Streak', `${detail.streak} hari`],
                    ['Terakhir belajar', tanggal(detail.terakhirAktif)],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-xl border p-3">
                      <dt className="text-muted-foreground">{l}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="space-y-3">
                  <p className="font-medium">Kelas yang diikuti</p>
                  {detail.kelas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum mengikuti kelas.</p>
                  ) : (
                    <ul className="space-y-3">
                      {detail.kelas.map((k) => (
                        <li key={k.idKelas} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{db.kelas.find((x) => x.id === k.idKelas)?.nama ?? 'Kelas dihapus'}</span>
                            <span className="text-muted-foreground">{k.progres}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${k.progres}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export { DataPelajarPage }
