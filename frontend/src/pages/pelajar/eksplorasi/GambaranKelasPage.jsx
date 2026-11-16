import { useState } from 'react'
import { MdPlayArrow, MdStar } from 'react-icons/md'
import { TbClockHour4 } from 'react-icons/tb'
import { useParams } from 'react-router'
import { CourseThumbnail, formatRating } from '@/components/pelajar/CourseCard'
import { Screen } from '@/components/pelajar/Screen'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { PratinjauSheet } from '@/components/pelajar/PratinjauSheet'
import { ErrorState, Loading, NotFoundState } from '@/components/pelajar/DataState'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { ambilKelas, beriRating, detailKelas } from '@/data/courseApi'
import { useAsync } from '@/hooks/useAsync'
import { formatDurasi } from '@/lib/learning'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC2-L04 Gambaran Kelas (alur E: gagal bergabung, alur F: lihat materi).
// Detail kelas & Ambil Kelas dari backend (GET /courses/:id, POST /courses/:id/enroll).
export function GambaranKelasPage() {
  const params = useParams()
  const { navigate } = useRouter()
  const toast = useToast()
  const id = Number(params.id)
  const muat = useAsync(() => detailKelas(id), [id])
  const [tab, setTab] = useState('pelajaran')
  const [gagal, setGagal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pesanGagal, setPesanGagal] = useState('')
  const [menilai, setMenilai] = useState(false)
  const [pratinjau, setPratinjau] = useState(false)
  if (muat.memuat)
    return (
      <Screen back title="Gambaran Kelas">
        <Loading />
      </Screen>
    )
  if (muat.gagal)
    return (
      <Screen back title="Gambaran Kelas">
        <ErrorState title="Kelas gagal dimuat" onRetry={muat.ulangi} />
      </Screen>
    )
  if (!muat.data)
    return (
      <Screen back title="Gambaran Kelas">
        <NotFoundState />
      </Screen>
    )
  const kelas = muat.data
  const daftar = kelas.pelajaran
  const sudahIkut = kelas.sudahIkut

  async function ambil() {
    setLoading(true)
    try {
      await ambilKelas(id)
      navigate(`/kelas/${id}/berhasil`, { replace: true })
    } catch (err) {
      setPesanGagal(err.message)
      setGagal(true)
    } finally {
      setLoading(false)
    }
  }

  async function nilai(bintang) {
    setMenilai(true)
    try {
      await beriRating(id, bintang)
      toast('Rating tersimpan')
      muat.ulangi()
    } catch (err) {
      toast(err.message || 'Rating gagal disimpan', 'gagal')
    } finally {
      setMenilai(false)
    }
  }

  return (
    <Screen kode="UC2-L04" back title="Gambaran Kelas" bell className="pb-32">
      <CourseThumbnail kelas={kelas} className="h-56 w-full rounded-3xl text-7xl shadow-[0_10px_30px_rgba(95,51,225,0.12)]" />
      <h1 className="mt-6 text-xl font-medium text-[#24252C]">{kelas.nama}</h1>
      <div className="mt-2 flex items-center gap-6 text-base text-subtle">
        <span className="inline-flex items-center gap-1.5">
          <TbClockHour4 className="size-5" /> {formatDurasi(kelas.detik)}
        </span>
        <span>{daftar.length} Pelajaran</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-lg bg-[#FBFAE2] px-2.5 py-1 text-base text-[#5F33E1]">
          <MdStar className="size-5 text-[#FFC71E]" />
          {formatRating(kelas.rating)}
        </span>
      </div>

      {sudahIkut && (
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#F5F1FF] px-4 py-3">
          <span className="text-sm text-[#6E6A7C]">{kelas.ratingSaya ? 'Ratingmu' : 'Beri rating kelas ini'}</span>
          <span role="group" aria-label="Beri rating" className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                disabled={menilai}
                aria-label={`${n} bintang`}
                aria-pressed={kelas.ratingSaya === n}
                onClick={() => nilai(n)}
                className="p-0.5 disabled:opacity-50"
              >
                <MdStar className={cn('size-7', n <= (kelas.ratingSaya ?? 0) ? 'text-[#FFC71E]' : 'text-[#D6D6DC]')} />
              </button>
            ))}
          </span>
        </div>
      )}

      <div role="tablist" className="mt-6 flex justify-center gap-10">
        {['pelajaran', 'deskripsi'].map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn('border-b-2 px-2 pb-3 text-lg font-medium transition', tab === t ? 'border-[#5F33E1] text-[#5F33E1]' : 'border-transparent text-subtle')}
          >
            {t === 'pelajaran' ? 'Pelajaran' : 'Deskripsi'}
          </button>
        ))}
      </div>

      {tab === 'pelajaran' && daftar.length === 0 ? (
        <p className="mt-6 text-center text-sm text-[#6E6A7C]">Belum ada pelajaran</p>
      ) : tab === 'pelajaran' ? (
        <ol className="mt-4 space-y-1">
          {daftar.map((p, i) => (
            <li key={p.id}>
              {i === 0 && !sudahIkut ? (
                <button type="button" onClick={() => setPratinjau(true)} className="flex w-full items-center gap-5 rounded-2xl py-3 text-left">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#5F33E1] text-white">
                    <MdPlayArrow className="size-7" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-base font-medium text-[#24252C]">{p.judul}</span>
                    <span className="block text-sm text-subtle">{formatDurasi(p.detik)}</span>
                  </span>
                  <span className="rounded-full bg-[#F5F1FF] px-3 py-1 text-xs font-medium text-[#5F33E1]">Pratinjau</span>
                </button>
              ) : (
                <div className="flex w-full items-center gap-5 rounded-2xl py-3 text-left">
                  <span
                    className={cn(
                      'flex size-12 shrink-0 items-center justify-center rounded-full',
                      i === 0 ? 'bg-[#5F33E1] text-white' : 'bg-white text-[#5F33E1] shadow-[0_4px_14px_rgba(36,37,44,0.10)]',
                    )}
                  >
                    <MdPlayArrow className="size-7" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-base font-medium text-[#24252C]">{p.judul}</span>
                    <span className="block text-sm text-subtle">{formatDurasi(p.detik)}</span>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-base leading-relaxed text-[#6E6A7C]">{kelas.deskripsi}</p>
      )}

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 bg-gradient-to-t from-white via-white/95 to-transparent px-12 pt-8 pb-6">
        {sudahIkut ? (
          <Button className="w-full" onClick={() => navigate(`/belajar/${id}`)}>
            Lanjut Belajar
          </Button>
        ) : (
          <Button className="w-full" loading={loading} disabled={daftar.length === 0} onClick={ambil}>
            Ambil Kelas
          </Button>
        )}
      </div>

      <PratinjauSheet open={pratinjau} onClose={() => setPratinjau(false)} idKelas={id} sudahIkut={sudahIkut} loading={loading} onAmbil={ambil} />

      <BottomSheet open={gagal} onClose={() => setGagal(false)} center>
        <div className="text-center">
          <p className={cn('text-lg font-semibold text-[#24252C]', HEADING_FONT)}>Kamu belum berhasil bergabung. Coba lagi, ya.</p>
          <p className="mt-2 text-sm text-[#6E6A7C]">{pesanGagal || 'Terjadi gangguan saat menyimpan kelas.'}</p>
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
