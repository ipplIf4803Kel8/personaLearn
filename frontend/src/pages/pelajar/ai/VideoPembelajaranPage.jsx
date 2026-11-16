import { useRef, useState } from 'react'
import { MdCheckCircle, MdErrorOutline, MdOpenInFull, MdPlayArrow, MdRefresh } from 'react-icons/md'
import { TbThumbDown, TbThumbUp } from 'react-icons/tb'
import { useParams } from 'react-router'
import { Screen } from '@/components/pelajar/Screen'
import { BotHeader, Chat } from '@/components/pelajar/Chat'
import { ErrorState, Loading, NotFoundState } from '@/components/pelajar/DataState'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { useAuth } from '@/context/AuthContext'
import { kirimReaksi, muatPelajaran, simpanPosisi, tandaiSelesai } from '@/data/learningApi'
import { useAsync } from '@/hooks/useAsync'
import { useSimpanPosisi, useYouTubePlayer, youtubeId } from '@/hooks/useYouTubePlayer'
import { formatDurasi, formatNomor } from '@/lib/learning'
import { isHttpUrl } from '@/lib/validators'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC6-L02 Video Pembelajaran + panel Sinau Bot (kondisi C: gagal diputar)
export function VideoPembelajaranPage() {
  const { id } = useParams()
  const { navigate } = useRouter()
  const toast = useToast()
  const { user } = useAuth()
  const muat = useAsync(() => muatPelajaran(id), [id])
  const [putar, setPutar] = useState(false)
  const [gagalPutar, setGagalPutar] = useState(false)
  const [percobaan, setPercobaan] = useState(0)
  const [menyimpan, setMenyimpan] = useState(false)
  const [reaksi, setReaksi] = useState(null)
  const [sudahSelesai, setSudahSelesai] = useState(false)
  const video = useRef(null)
  const p = muat.data
  const sedangTandai = useRef(false)
  const urlAman = p && isHttpUrl(p.videoUrl) ? p.videoUrl : null
  const idYt = youtubeId(urlAman)
  const ytRef = useRef(null)
  const waktuVideo = useRef(0)
  const aktifSimpan = !!p && !(sudahSelesai || p.completed)
  const posisi = useSimpanPosisi({
    aktif: aktifSimpan,
    getPosisi: () => (idYt ? ytRef.current?.getPosition() : (video.current?.currentTime ?? waktuVideo.current)),
    simpan: (detik, opsi) => simpanPosisi(p.id, detik, opsi),
  })
  const yt = useYouTubePlayer(idYt, {
    onPlay: posisi.mulai,
    onPause: posisi.jeda,
    start: p?.lastPositionSeconds > 0 ? p.lastPositionSeconds : 0,
    onEnded: (detik) => tandaiRef.current(detik),
  })
  ytRef.current = yt
  const tandaiRef = useRef(() => {})

  if (muat.memuat)
    return (
      <Screen back title="Video">
        <Loading />
      </Screen>
    )
  if (muat.gagal || !p)
    return (
      <Screen back title="Video">
        {muat.gagal ? (
          <ErrorState title="Pelajaran gagal dimuat" onRetry={muat.ulangi} />
        ) : (
          <NotFoundState title="Pelajaran tidak ditemukan" desc="Pelajaran tidak ada atau kelasnya belum Anda ambil." to="/kelas-anda" label="Ke Kelas Saya" />
        )}
      </Screen>
    )

  const selesai = sudahSelesai || p.completed
  const nilai = reaksi ?? { likes: p.likes, dislikes: p.dislikes, myReaction: p.myReaction }
  const videoUrl = isHttpUrl(p.videoUrl) ? p.videoUrl : null

  async function tandai(posisi) {
    if (sedangTandai.current || selesai) return
    sedangTandai.current = true
    setMenyimpan(true)
    try {
      const detik = typeof posisi === 'number' ? posisi : idYt ? yt.getPosition() : Math.floor(video.current?.currentTime ?? 0)
      const r = await tandaiSelesai(p.id, detik)
      setSudahSelesai(true)
      if (r.pointsEarned > 0) toast(`+${r.pointsEarned} poin`)
      navigate(`/belajar/${p.courseId}${r.courseCompleted ? '?hasil=tinggi' : ''}`, { replace: true })
    } catch (e) {
      toast(e.message || 'Progres gagal disimpan. Coba lagi.', 'gagal')
    } finally {
      sedangTandai.current = false
      setMenyimpan(false)
    }
  }
  tandaiRef.current = tandai

  async function beriReaksi(jenis) {
    try {
      setReaksi(await kirimReaksi(p.id, nilai.myReaction === jenis ? null : jenis))
    } catch (e) {
      toast(e.message || 'Reaksi gagal disimpan.', 'gagal')
    }
  }

  return (
    <Screen kode="UC6-L02" back title={p.title} bell className="px-0 pb-28">
      <div className="px-6">
        <div className="overflow-hidden rounded-3xl bg-[#3A3A3A] shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          {!videoUrl ? (
            <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#E8E0FF] to-[#CBB9FF] p-6 text-center">
              <p className="text-base font-semibold text-[#24252C]">{p.title}</p>
              <p className="text-xs text-[#4A27B8]">Video segera hadir. Baca ringkasan materi di bawah, ya.</p>
            </div>
          ) : idYt ? (
            <div ref={yt.ref} role="region" aria-label={p.title} className="aspect-[16/9] w-full [&_iframe]:size-full" />
          ) : gagalPutar ? (
            <div className="flex aspect-[16/9] flex-col items-center justify-center gap-3 p-6 text-center text-white">
              <MdErrorOutline className="size-10 text-rose-300" />
              <p className="font-medium">Video belum bisa diputar.</p>
              <button
                type="button"
                onClick={() => {
                  setGagalPutar(false)
                  setPercobaan((n) => n + 1)
                }}
                className="flex items-center gap-1 rounded-full bg-white/15 px-4 py-2 text-xs font-medium"
              >
                <MdRefresh /> Coba lagi
              </button>
            </div>
          ) : putar ? (
            <video
              key={percobaan}
              ref={video}
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="aspect-[16/9] w-full bg-black"
              onLoadedMetadata={(e) => {
                if (p.lastPositionSeconds > 0 && p.lastPositionSeconds < e.currentTarget.duration - 2) e.currentTarget.currentTime = p.lastPositionSeconds
              }}
              onPlay={posisi.mulai}
              onPause={posisi.jeda}
              onTimeUpdate={(e) => (waktuVideo.current = e.currentTarget.currentTime)}
              onError={() => setGagalPutar(true)}
              onEnded={() => tandai()}
            />
          ) : (
            <button type="button" aria-label={`Putar video ${p.title}`} onClick={() => setPutar(true)} className="flex aspect-[16/9] w-full items-center justify-center">
              <MdPlayArrow className="size-24 text-white" />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-xl text-[#24252C]">{p.title}</h2>
            <p className="text-xs font-medium tracking-wide text-[#24252C] uppercase">
              {formatNomor(p.number)} / {formatNomor(p.totalLessons)} | {p.courseTitle}{p.durationSeconds > 0 && ` | ${formatDurasi(p.durationSeconds)}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center rounded-full bg-[#F2F4F5] px-3 py-1.5 text-xs font-semibold text-[#24252C]">
            <button type="button" aria-label="Suka video" aria-pressed={nilai.myReaction === 'like'} onClick={() => beriReaksi('like')} className={cn('flex items-center gap-1 pr-2', nilai.myReaction === 'like' && 'text-[#5F33E1]')}>
              <TbThumbUp className="size-5" /> {nilai.likes}
            </button>
            <span className="h-4 w-px bg-[#C9CBD3]" />
            <button type="button" aria-label="Tidak suka video" aria-pressed={nilai.myReaction === 'dislike'} onClick={() => beriReaksi('dislike')} className={cn('flex items-center gap-1 pl-2', nilai.myReaction === 'dislike' && 'text-[#5F33E1]')}>
              <TbThumbDown className="size-5" /> {nilai.dislikes}
            </button>
          </div>
        </div>

        {p.description && (
          <div className="mt-4 rounded-2xl bg-[#F5F1FF] p-4">
            <p className="text-xs font-semibold tracking-wide text-[#5F33E1] uppercase">Ringkasan Materi</p>
            <p className="mt-1 text-sm leading-relaxed text-[#24252C]">{p.description}</p>
          </div>
        )}

        <Button className="mt-4 w-full py-3 text-sm" loading={menyimpan} disabled={selesai} onClick={() => tandai()}>
          {selesai ? (
            <>
              <MdCheckCircle className="size-5" /> Sudah selesai
            </>
          ) : (
            'Tandai Selesai'
          )}
        </Button>
      </div>

      <section data-testid="panel-sinau-bot" className="mt-6 rounded-t-[2rem] bg-white px-6 pt-4 pb-4 shadow-[0_-10px_30px_rgba(36,37,44,0.06)]">
        <div className="mx-auto h-1.5 w-16 rounded-full bg-[#CBB9FF]" />
        <div className="mt-5 flex items-center justify-between gap-3">
          <BotHeader />
          <button type="button" aria-label="Buka obrolan penuh" onClick={() => navigate(`/obrolan/${p.id}`)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#F5F1FF] px-3 py-2 text-xs font-medium text-[#5F33E1]">
            <MdOpenInFull className="size-4" /> Obrolan penuh
          </button>
        </div>
        <div className="mt-4">
          <Chat lessonId={p.id} nama={user?.name} tertanam />
        </div>
      </section>
    </Screen>
  )
}
