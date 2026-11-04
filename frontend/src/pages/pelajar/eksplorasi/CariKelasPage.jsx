import { useState } from 'react'
import { MdClose, MdSearch } from 'react-icons/md'
import { Chip } from '@/components/pelajar/Chip'
import { CourseCard } from '@/components/pelajar/CourseCard'
import { SearchBar } from '@/components/pelajar/SearchBar'
import { Screen } from '@/components/pelajar/Screen'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { Loading, ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { TextLink, Button } from '@/components/pelajar/Button'
import { useDb } from '@/data/db'
import { useAsync } from '@/hooks/useAsync'
import { cariKelas } from '@/data/courseApi'
import { useRouter } from '@/lib/router'

export const TINGKAT = ['Pemula', 'Menengah', 'Lanjut']

export const RATING = [4, 4.5, 4.8]

export const DURASI = [
  { id: 'pendek', label: '< 30 mnt' },
  { id: 'sedang', label: '30 – 60 mnt' },
  { id: 'panjang', label: '> 60 mnt' },
]

// UC2-L02 Cari Kelas + UC2-L03 Filter Kelas (kondisi C: hasil kosong, D: koneksi bermasalah)
export function CariKelasPage() {
  const { navigate, query } = useRouter()
  const { db } = useDb()
  const [q, setQ] = useState('')
  const [idKategori, setIdKategori] = useState(null)
  const [filter, setFilter] = useState({ tingkat: [], ratingMin: 0, durasi: null })
  const [draf, setDraf] = useState({ ...filter, idKategori: null })
  const [panel, setPanel] = useState(query.filter === '1')
  const hasil = useAsync(() => cariKelas({ q, idKategori, ...filter }), [q, idKategori, filter]) // data dari backend
  const jumlahFilter = filter.tingkat.length + (filter.ratingMin ? 1 : 0) + (filter.durasi ? 1 : 0)
  const filterGagal = db.simulasi.koneksi
  const kategoriUrut = [...db.kategori].sort((a, b) => (b.id === idKategori) - (a.id === idKategori))

  function bukaFilter() {
    setDraf({ ...filter, idKategori })
    setPanel(true)
  }
  function hapusSemua() {
    setQ('')
    setIdKategori(null)
    setFilter({ tingkat: [], ratingMin: 0, durasi: null })
  }
  const kosong = { tingkat: [], ratingMin: 0, durasi: null, idKategori: null }

  return (
    <Screen kode="UC2-L02" back title="Cari Kelas" nav actions={<FavoritesHeaderButton />}>
      <SearchBar value={q} onChange={setQ} autoFocus onFilter={bukaFilter} jumlahFilter={jumlahFilter} />

      <div className="-mx-6 mt-6 flex gap-2 overflow-x-auto px-6 pb-1">
        {kategoriUrut.map((k) =>
          idKategori === k.id ? (
            <Chip key={k.id} aktif onClick={() => setIdKategori(null)} aria-label={`Hapus filter ${k.nama}`}>
              <span className="inline-flex items-center gap-1">
                {k.nama} <MdClose className="size-4" />
              </span>
            </Chip>
          ) : (
            <button key={k.id} type="button" onClick={() => setIdKategori(k.id)} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm text-[#A9A9B2] hover:text-[#6E6A7C]">
              {k.nama}
            </button>
          ),
        )}
      </div>

      <div className="mt-6 space-y-4">
        {hasil.memuat ? (
          <Loading />
        ) : hasil.gagal ? (
          <ErrorState title="Daftar kelas gagal dimuat" onRetry={hasil.ulangi} />
        ) : hasil.data.length === 0 ? (
          <EmptyState icon={MdSearch} title="Kelasnya belum ketemu" desc="Coba kata kunci lain." action={<Button variant="outline" className="py-3" onClick={hapusSemua}>Hapus pencarian dan filter</Button>} />
        ) : (
          hasil.data.map((k) => <CourseCard key={k.id} kelas={k} />)
        )}
      </div>

      <BottomSheet
        open={panel}
        onClose={() => setPanel(false)}
        title="Filter Kelas"
        kode="UC2-L03"
        kanan={<TextLink onClick={() => setDraf(kosong)}>Reset</TextLink>}
      >
        {filterGagal ? (
          <ErrorState title="Filter gagal dimuat" onRetry={() => {
            setPanel(false)
            setTimeout(() => setPanel(true), 200)
          }} />
        ) : (
          <div className="space-y-4">
            <FilterGroup label="Kategori">
              {db.kategori.map((k) => (
                <Chip key={k.id} aktif={draf.idKategori === k.id} onClick={() => setDraf((d) => ({ ...d, idKategori: d.idKategori === k.id ? null : k.id }))}>
                  {k.nama}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Tingkat">
              {TINGKAT.map((t) => (
                <Chip key={t} aktif={draf.tingkat.includes(t)} onClick={() => setDraf((d) => ({ ...d, tingkat: d.tingkat.includes(t) ? d.tingkat.filter((x) => x !== t) : [...d.tingkat, t] }))}>
                  {t}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Rating minimum">
              {RATING.map((r) => (
                <Chip key={r} aktif={draf.ratingMin === r} onClick={() => setDraf((d) => ({ ...d, ratingMin: d.ratingMin === r ? 0 : r }))}>
                  {r.toFixed(1)} ke atas
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Durasi">
              {DURASI.map((x) => (
                <Chip key={x.id} aktif={draf.durasi === x.id} onClick={() => setDraf((d) => ({ ...d, durasi: d.durasi === x.id ? null : x.id }))}>
                  {x.label}
                </Chip>
              ))}
            </FilterGroup>
            <div className="flex justify-center pt-3">
              <Button
                className="w-4/5"
                onClick={() => {
                  const { idKategori: kat, ...f } = draf
                  setIdKategori(kat)
                  setFilter(f)
                  setPanel(false)
                }}
              >
                Terapkan Filter
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </Screen>
  )
}

export function FilterGroup({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-base font-medium text-[#24252C]">{label}</p>
      <div className="flex flex-wrap gap-2 [&>button]:px-3.5 [&>button]:py-1.5">{children}</div>
    </div>
  )
}

export function FavoritesHeaderButton() {
  const { navigate } = useRouter()
  return (
    <button type="button" aria-label="Kelas Favorit" onClick={() => navigate('/favorit')} className="flex size-10 items-center justify-center text-[#A9A9B2] hover:text-[#F0384B]">
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M12 20s-7-4.4-9.2-8.6C1.3 8.5 3 5 6.4 5c2 0 3.2 1.1 3.9 2.2.3.5.9.5 1.2 0C12.2 6.1 13.5 5 15.6 5 19 5 20.7 8.5 19.2 11.4 17 15.6 12 20 12 20z" />
      </svg>
    </button>
  )
}
