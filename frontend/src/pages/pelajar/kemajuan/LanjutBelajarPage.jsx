import { useState } from 'react'
import { HiUsers } from 'react-icons/hi'
import { MdCheck, MdPlayArrow, MdStar } from 'react-icons/md'
import { useParams } from 'react-router'
import { CourseThumbnail, formatRating } from '@/components/pelajar/CourseCard'
import { Screen } from '@/components/pelajar/Screen'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { ProgressBar } from '@/components/pelajar/Progress'
import { Loading, ErrorState, EmptyState, NotFoundState } from '@/components/pelajar/DataState'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { muatProgresKelas } from '@/data/learningApi'
import { useAsync } from '@/hooks/useAsync'
import { formatDurasi, formatNomor, idValid, formatRibu } from '@/lib/learning'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC3-L02 Lanjut Belajar (+ UC3-L03 Reward saat seluruh pelajaran selesai)
export function LanjutBelajarPage() {
  const { id } = useParams()
  const { navigate, query } = useRouter()
  const muat = useAsync(() => muatProgresKelas(id), [id])
  const [hasil, setHasil] = useState(query.hasil ?? null)
  const k = muat.data

  if (muat.memuat)
    return (
      <Screen back="/kelas-anda" title="Lanjut Belajar">
        <Loading />
      </Screen>
    )
  if (muat.gagal || !k)
    return (
      <Screen back="/kelas-anda" title="Lanjut Belajar">
        {muat.gagal ? (
          <ErrorState title="Kelas gagal dimuat" onRetry={muat.ulangi} />
        ) : idValid(id) ? (
          <EmptyState title="Kelas ini belum Anda ambil" desc="Kelas tidak ditemukan di daftar kelas Anda." action={<Button className="py-3" onClick={() => navigate(`/kelas/${id}`)}>Lihat Kelas</Button>} />
        ) : (
          <NotFoundState />
        )}
      </Screen>
    )

  const bukaPelajaran = (pelajaranId) => navigate(`/video/${pelajaranId}`)
  const berikut = k.nextLessonId ?? k.lessons[0]?.id

  return (
    <Screen kode="UC3-L02" back="/kelas-anda" title="Lanjut Belajar" bell blobs={false} latar="bg-[#F5F1FF]" className="px-0 pb-32">
      <section className="relative overflow-hidden px-6 pt-3 pb-12">
        <div className="pointer-events-none absolute top-6 -right-10 h-72 w-64 rotate-12 rounded-[3rem] bg-[#CBB9FF]/70" />
        <CourseThumbnail kelas={{ gambar: k.thumbnailUrl }} className="pointer-events-none absolute top-10 right-0 h-56 w-40 bg-transparent text-[7rem] opacity-90" />
        <span className="relative inline-block rounded-full bg-[#CBB9FF] px-3 py-1 text-xs font-semibold tracking-wide text-[#24252C] uppercase">{k.categoryName}</span>
        <h1 className={cn('relative mt-3 max-w-[70%] text-2xl leading-tight font-semibold text-[#191D40]', HEADING_FONT)}>{k.title}</h1>
        <div className="relative mt-3 flex items-center gap-6 text-base text-[#6E6A7C]">
          <span className="inline-flex items-center gap-1.5">
            <HiUsers className="size-5" /> {formatRibu(k.studentsCount)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MdStar className="size-5" /> {formatRating(k.rating)}
          </span>
        </div>
        <p className="relative mt-8 text-sm font-semibold text-[#24252C]">Progres Belajarmu</p>
        <p className={cn('relative text-2xl font-semibold text-subtle', HEADING_FONT)} aria-label={`${k.completedLessons} dari ${k.totalLessons} pelajaran selesai`}>
          {formatNomor(k.completedLessons)}/{formatNomor(k.totalLessons)}
        </p>
        <ProgressBar value={k.progressPercent} className="relative mt-2 w-1/2 bg-white" />
      </section>

      <section className="relative -mt-4 min-h-[50vh] rounded-t-[2rem] bg-white px-6 pt-4">
        <div className="mx-auto h-1.5 w-16 rounded-full bg-[#CBB9FF]" />
        <h2 className={cn('mt-5 text-center text-xl font-semibold text-[#24252C]', HEADING_FONT)}>Konten Kelas</h2>
        {k.lessons.length === 0 ? (
          <EmptyState title="Belum ada pelajaran" desc="Pelajaran akan muncul setelah ditambahkan." />
        ) : (
          <ol className="mt-4">
            {k.lessons.map((p, i) => (
              <li key={p.id}>
                <button type="button" onClick={() => bukaPelajaran(p.id)} className={cn('flex w-full items-center gap-3 rounded-2xl px-2 py-3 min-[380px]:gap-5 text-left', p.id === k.nextLessonId && 'bg-[#F5F1FF]')}>
                  <span className={cn('w-8 shrink-0 text-2xl font-light text-subtle min-[380px]:w-12 min-[380px]:text-3xl', HEADING_FONT)}>{formatNomor(i + 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-base leading-snug break-words text-[#24252C] min-[380px]:text-lg">{p.title}</span>
                    <span className="mt-0.5 block text-sm text-subtle">{p.completed ? 'Selesai' : formatDurasi(p.durationSeconds)}</span>
                  </span>
                  <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-full text-white', p.completed ? 'bg-[#22A45D]' : 'bg-[#5F33E1]')}>
                    {p.completed ? <MdCheck className="size-6" /> : <MdPlayArrow className="size-7" />}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      {berikut && (
        <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 rounded-t-[2rem] bg-white px-8 pt-5 pb-6 shadow-[0_-8px_24px_rgba(36,37,44,0.06)]">
          <Button className="w-full rounded-full" onClick={() => bukaPelajaran(berikut)}>
            {k.progressPercent >= 100 ? 'Ulangi Materi' : 'Lanjut Belajar'}
          </Button>
        </div>
      )}

      <BottomSheet open={hasil === 'tinggi'} onClose={() => setHasil(null)} center kode="UC3-L03">
        <div className="text-center">
          <div className="mx-auto flex size-32 items-center justify-center rounded-full bg-[#FFF0C2] text-[#FFC71E]">
            <MdStar className="size-20" />
          </div>
          <h2 className={cn('mt-5 text-xl font-semibold text-[#24252C]', HEADING_FONT)}>Kelas selesai, hebat!</h2>
          <p className="mt-2 text-base text-[#6E6A7C]">Anda sudah menyelesaikan semua pelajaran di {k.title}.</p>
          <Button className="mt-6 w-full" onClick={() => setHasil(null)}>
            Tutup
          </Button>
        </div>
      </BottomSheet>
    </Screen>
  )
}
