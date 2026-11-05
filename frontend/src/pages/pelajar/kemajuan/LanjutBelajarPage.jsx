import { useMemo, useState } from 'react'
import { HiUsers } from 'react-icons/hi'
import { MdCheck, MdPlayArrow, MdStar } from 'react-icons/md'
import { useParams } from 'react-router'
import { CourseThumbnail } from '@/components/pelajar/CourseCard'
import { Screen } from '@/components/pelajar/Screen'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { ProgressBar } from '@/components/pelajar/Progress'
import { EmptyState } from '@/components/pelajar/DataState'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { jumlahPelajar, kategoriDari, kelasDiikutiSaya, pelajaranKelas, penggunaAktif, useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

export function formatNomor(n) {
  return String(n).padStart(2, '0')
}

export function formatRibu(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n)
}

export function durasiMnt(menit) {
  const total = Math.round(Number(menit) * 60)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')} mnt`
}

// UC3-L02 Lanjut Belajar (+ UC3-L03 Reward, UC3-L07 Saran Materi)
export function LanjutBelajarPage() {
  const params = useParams()
  const { navigate, query } = useRouter()
  const { db } = useDb()
  const id = Number(params.id)
  const item = kelasDiikutiSaya(db).find((k) => k.idKelas === id)
  const daftar = pelajaranKelas(db, id)
  const [hasil, setHasil] = useState(query.hasil ?? null)
  const u = penggunaAktif(db)
  const mingguIni = useMemo(() => {
    const batas = Date.now() - 7 * 864e5
    return db.riwayatBelajar.filter((r) => r.idPengguna === u?.id && new Date(r.tanggal).getTime() >= batas).reduce((s, r) => s + r.materiSelesai, 0)
  }, [db, u])
  if (!item)
    return (
      <Screen back title="Lanjut Belajar">
        <EmptyState title="Anda belum mengambil kelas ini" action={<Button className="py-3" onClick={() => navigate(`/kelas/${id}`)}>Lihat Kelas</Button>} />
      </Screen>
    )
  const berikut = daftar.find((p) => !item.selesai.includes(p.id)) ?? daftar[daftar.length - 1]
  const saran = daftar.filter((p) => !item.selesai.includes(p.id)).slice(0, 2)
  const kat = kategoriDari(db, item.kelas.idKategori)

  return (
    <Screen kode="UC3-L02" back="/kelas-anda" title="Lanjut Belajar" bell blobs={false} latar="bg-[#F5F1FF]" className="px-0 pb-32">
      {/* Bagian atas: info kelas */}
      <section className="relative overflow-hidden px-6 pt-3 pb-12">
        <div className="pointer-events-none absolute top-6 -right-10 h-72 w-64 rotate-12 rounded-[3rem] bg-[#CBB9FF]/70" />
        <CourseThumbnail kelas={item.kelas} className="pointer-events-none absolute top-10 right-0 h-56 w-40 bg-transparent text-[7rem] opacity-90" />
        <span className="relative inline-block rounded-full bg-[#CBB9FF] px-3 py-1 text-xs font-semibold tracking-wide text-[#24252C] uppercase">{kat?.nama}</span>
        <h1 className={cn('relative mt-3 max-w-[70%] text-2xl leading-tight font-semibold text-[#191D40]', HEADING_FONT)}>{item.kelas.nama}</h1>
        <div className="relative mt-3 flex items-center gap-6 text-base text-[#6E6A7C]">
          <span className="inline-flex items-center gap-1.5">
            <HiUsers className="size-5" /> {formatRibu(jumlahPelajar(db, id))}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MdStar className="size-5" /> {Number(item.kelas.rating).toFixed(1)}
          </span>
        </div>
        <p className="relative mt-8 text-sm font-semibold text-[#24252C]">Progres Belajarmu</p>
        <p className={cn('relative text-2xl font-semibold text-[#A9A9B2]', HEADING_FONT)} aria-label={`${item.selesai.length} dari ${daftar.length} pelajaran selesai`}>
          {formatNomor(item.selesai.length)}/{formatNomor(daftar.length)}
        </p>
        <ProgressBar value={item.progres} className="relative mt-2 w-1/2 bg-white" />
      </section>

      {/* Konten Kelas */}
      <section className="relative -mt-4 min-h-[50vh] rounded-t-[2rem] bg-white px-6 pt-4">
        <div className="mx-auto h-1.5 w-16 rounded-full bg-[#CBB9FF]" />
        <h2 className={cn('mt-5 text-center text-xl font-semibold text-[#24252C]', HEADING_FONT)}>Konten Kelas</h2>
        <ol className="mt-4">
          {daftar.map((p, i) => {
            const selesai = item.selesai.includes(p.id)
            return (
              <li key={p.id}>
                <button type="button" onClick={() => navigate(`/video/${p.id}?belajar=1`)} className={cn('flex w-full items-center gap-5 rounded-2xl px-2 py-3 text-left', p.id === berikut?.id && !selesai && 'bg-[#F5F1FF]')}>
                  <span className={cn('w-12 shrink-0 text-3xl font-light text-[#D6D6DC]', HEADING_FONT)}>{formatNomor(i + 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-[#8A8A94]">{selesai ? 'Selesai' : durasiMnt(p.durasi)}</span>
                    <span className="block truncate text-lg text-[#24252C]">{p.judul}</span>
                  </span>
                  <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-full text-white', selesai ? 'bg-[#22A45D]' : 'bg-[#5F33E1]')}>
                    {selesai ? <MdCheck className="size-6" /> : <MdPlayArrow className="size-7" />}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 rounded-t-[2rem] bg-white px-8 pt-5 pb-6 shadow-[0_-8px_24px_rgba(36,37,44,0.06)]">
        <Button className="w-full rounded-full" onClick={() => navigate(`/video/${berikut.id}?belajar=1`)}>
          {item.progres >= 100 ? 'Ulangi Materi' : 'Lanjut Belajar'}
        </Button>
      </div>

      {/* UC3-L03 Reward Kemajuan Tinggi */}
      <BottomSheet open={hasil === 'tinggi'} onClose={() => setHasil(null)} center kode="UC3-L03">
        <div className="text-center">
          <div className="mx-auto flex size-32 items-center justify-center rounded-full bg-[#FFF0C2] text-[#FFC71E]">
            <MdStar className="size-20" />
          </div>
          <h2 className={cn('mt-5 text-xl font-semibold text-[#24252C]', HEADING_FONT)}>Hebat, progres Anda tinggi!</h2>
          <p className="mt-2 text-base text-[#6E6A7C]">Anda menyelesaikan {mingguIni} pelajaran minggu ini. Terus pertahankan ritme belajarnya.</p>
          <div className="mt-5 flex justify-center gap-3">
            <span className="rounded-xl bg-[#EEE9FF] px-4 py-2 text-base text-[#5F33E1]">+20 poin</span>
            <span className="rounded-xl bg-[#EEE9FF] px-4 py-2 text-base text-[#5F33E1]">Streak {u?.streak} hari</span>
          </div>
          <Button className="mt-6 w-full" onClick={() => setHasil(null)}>
            Lanjut Belajar
          </Button>
        </div>
      </BottomSheet>

      {/* UC3-L07 Saran Materi (alur D: kemajuan rendah) */}
      <BottomSheet open={hasil === 'rendah'} onClose={() => setHasil(null)} title="Perlu Materi Tambahan?" kode="UC3-L07">
        <p className="text-base text-[#6E6A7C]">Progres Anda di {item.kelas.nama} sedikit melambat. Coba materi pendukung ini:</p>
        <ul className="mt-4 space-y-3">
          {saran.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-[#F7F7F9] p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg text-[#24252C]">{p.judul}</p>
                <p className="text-sm text-[#6E6A7C]">Video · {durasiMnt(p.durasi)}</p>
              </div>
              <button type="button" aria-label={`Putar ${p.judul}`} onClick={() => navigate(`/video/${p.id}?belajar=1`)} className="flex size-12 items-center justify-center rounded-xl bg-[#5F33E1] text-white">
                <MdPlayArrow className="size-7" />
              </button>
            </li>
          ))}
        </ul>
        <Button className="mt-5 w-full" onClick={() => navigate(`/video/${saran[0]?.id ?? berikut.id}?belajar=1`)}>
          Terima Saran
        </Button>
        <Button variant="ghost" className="mt-1 w-full py-3 text-sm" onClick={() => setHasil(null)}>
          Tidak, terima kasih
        </Button>
      </BottomSheet>
    </Screen>
  )
}
