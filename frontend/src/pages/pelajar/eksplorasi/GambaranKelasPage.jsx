import { useState } from 'react'
import { MdChevronRight, MdPlayArrow, MdStar } from 'react-icons/md'
import { TbClockHour4 } from 'react-icons/tb'
import { useParams } from 'react-router'
import { CourseThumbnail } from '@/components/pelajar/CourseCard'
import { Screen } from '@/components/pelajar/Screen'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { EmptyState } from '@/components/pelajar/DataState'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { formatDuration, HEADING_FONT } from '@/components/pelajar/theme'
import { durasiKelas, kelasDiikutiSaya, pelajaranKelas, useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

export function durasiMenitDetik(menit) {
  const total = Math.round(Number(menit) * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')} mnt`
}

// UC2-L04 Gambaran Kelas (alur E: gagal bergabung, alur F: lihat materi)
export function GambaranKelasPage() {
  const params = useParams()
  const { navigate } = useRouter()
  const { db, aksi } = useDb()
  const toast = useToast()
  const id = Number(params.id)
  const kelas = db.kelas.find((k) => k.id === id)
  const [tab, setTab] = useState('pelajaran')
  const [gagal, setGagal] = useState(false)
  const [loading, setLoading] = useState(false)
  if (!kelas || kelas.status !== 'terbit')
    return (
      <Screen back title="Gambaran Kelas">
        <EmptyState title="Kelas tidak tersedia" />
      </Screen>
    )
  const daftar = pelajaranKelas(db, id)
  const sudahIkut = kelasDiikutiSaya(db).some((k) => k.idKelas === id)

  async function ambil() {
    setLoading(true)
    try {
      await aksi.ambilKelas(id)
      navigate(`/kelas/${id}/berhasil`, { replace: true })
    } catch {
      setGagal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen kode="UC2-L04" back title="Gambaran Kelas" bell className="pb-32">
      <CourseThumbnail kelas={kelas} className="h-56 w-full rounded-3xl text-7xl shadow-[0_10px_30px_rgba(95,51,225,0.12)]" />
      <h1 className="mt-6 text-xl font-medium text-[#24252C]">{kelas.nama}</h1>
      <div className="mt-2 flex items-center gap-6 text-base text-[#8A8A94]">
        <span className="inline-flex items-center gap-1.5">
          <TbClockHour4 className="size-5" /> {formatDuration(durasiKelas(db, id))}
        </span>
        <span>{daftar.length} Pelajaran</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-lg bg-[#FBFAE2] px-2.5 py-1 text-base text-[#5F33E1]">
          <MdStar className="size-5 text-[#FFC71E]" />
          {Number(kelas.rating).toFixed(1)}
        </span>
      </div>

      <div role="tablist" className="mt-6 flex justify-center gap-10">
        {['pelajaran', 'deskripsi'].map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn('border-b-2 px-2 pb-3 text-lg font-medium transition', tab === t ? 'border-[#5F33E1] text-[#5F33E1]' : 'border-transparent text-[#C9CBD3]')}
          >
            {t === 'pelajaran' ? 'Pelajaran' : 'Deskripsi'}
          </button>
        ))}
      </div>

      {tab === 'pelajaran' ? (
        <ol className="mt-4 space-y-1">
          {daftar.map((p, i) => (
            <li key={p.id}>
              <button type="button" onClick={() => navigate(`/video/${p.id}?pratinjau=1`)} className="flex w-full items-center gap-5 rounded-2xl py-3 text-left hover:bg-[#F5F1FF]">
                <span
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-full',
                    i === 0 ? 'bg-[#5F33E1] text-white' : 'bg-white text-[#5F33E1] shadow-[0_4px_14px_rgba(36,37,44,0.10)]',
                  )}
                >
                  <MdPlayArrow className="size-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-medium text-[#24252C]">{p.judul}</span>
                  <span className="block text-sm text-[#A9A9B2]">{durasiMenitDetik(p.durasi)}</span>
                </span>
                <MdChevronRight className="size-7 text-[#5F33E1]" />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-base leading-relaxed text-[#6E6A7C]">{kelas.deskripsi}</p>
      )}

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 bg-gradient-to-t from-white via-white/95 to-transparent px-12 pt-8 pb-6">
        {sudahIkut ? (
          <Button className="w-full" onClick={() => navigate(`/belajar/${id}`)}>
            Lanjut Belajar
          </Button>
        ) : (
          <Button className="w-full" loading={loading} onClick={ambil}>
            Ambil Kelas
          </Button>
        )}
      </div>

      <BottomSheet open={gagal} onClose={() => setGagal(false)} center>
        <div className="text-center">
          <p className={cn('text-lg font-semibold text-[#24252C]', HEADING_FONT)}>Kamu belum berhasil bergabung. Coba lagi, ya.</p>
          <p className="mt-2 text-sm text-[#6E6A7C]">Terjadi gangguan saat menyimpan kelas.</p>
          <Button
            className="mt-6 w-full"
            onClick={() => {
              setGagal(false)
              ambil().catch(() => toast('Gagal', 'gagal'))
            }}
          >
            Coba lagi
          </Button>
        </div>
      </BottomSheet>
    </Screen>
  )
}
