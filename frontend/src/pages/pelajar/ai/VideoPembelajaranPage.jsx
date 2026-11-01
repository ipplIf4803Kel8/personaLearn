import { useState } from 'react'
import { MdCheckCircle, MdErrorOutline, MdPlayArrow, MdRefresh } from 'react-icons/md'
import { TbThumbDown, TbThumbUp } from 'react-icons/tb'
import { useParams } from 'react-router'
import { Screen } from '@/components/pelajar/Screen'
import { ChatBubble, MessageInput, BotHeader, botGreeting, formatChatTime } from '@/components/pelajar/Chat'
import { EmptyState } from '@/components/pelajar/DataState'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { kategoriDari, kelasDiikutiSaya, pelajaranKelas, penggunaAktif, useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

export const SARAN_PERTANYAAN = ['Ringkas inti materi ini', 'Beri contoh sederhana', 'Kenapa materi ini penting?']

// UC6-L02 Video Pembelajaran + panel Sinau Bot (kondisi C: gagal diputar)
// ?belajar=1 dipakai dari UC3 (simpan progres), ?pratinjau=1 dari Gambaran Kelas (UC2 alur F).
export function VideoPembelajaranPage() {
  const params = useParams()
  const { navigate, query } = useRouter()
  const { db, aksi } = useDb()
  const toast = useToast()
  const id = Number(params.id)
  const p = db.pelajaran.find((x) => x.id === id)
  const [putar, setPutar] = useState(false)
  const [gagalPutar, setGagalPutar] = useState(false)
  const [percobaan, setPercobaan] = useState(0)
  const [menyimpan, setMenyimpan] = useState(false)
  const [jam] = useState(() => formatChatTime())
  const u = penggunaAktif(db)
  if (!p)
    return (
      <Screen back title="Video">
        <EmptyState title="Pelajaran tidak ditemukan" />
      </Screen>
    )
  const daftar = pelajaranKelas(db, p.idKelas)
  const kelas = db.kelas.find((k) => k.id === p.idKelas)
  const ikut = kelasDiikutiSaya(db).find((k) => k.idKelas === p.idKelas)
  const sudahSelesai = ikut?.selesai.includes(id)
  const penilaian = db.penilaianVideo.filter((v) => v.idPelajaran === id)
  const nilaiSaya = penilaian.find((v) => v.idPengguna === u?.id)?.nilai ?? 0
  const suka = penilaian.filter((v) => v.nilai >= 4).length
  const tidakSuka = penilaian.filter((v) => v.nilai <= 2).length
  const offline = db.simulasi.koneksi
  const urutan = daftar.findIndex((x) => x.id === id) + 1

  async function selesai() {
    setMenyimpan(true)
    try {
      const r = await aksi.simpanProgres(p.idKelas, id)
      navigate(`/belajar/${p.idKelas}${r.hasil ? `?hasil=${r.hasil.jenis}` : ''}`, { replace: true })
    } catch {
      toast('Progres gagal disimpan. Coba lagi.', 'gagal')
    } finally {
      setMenyimpan(false)
    }
  }
  const tanya = (t) => navigate(`/obrolan/${id}?q=${encodeURIComponent(t)}`)

  return (
    <Screen kode="UC6-L02" back title={p.judul} bell className="px-0 pb-28">
      <div className="px-6">
        <div className="overflow-hidden rounded-3xl bg-[#3A3A3A] shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          {!p.urlVideo ? (
            // Sementara belum ada video: tampilkan gambar materi
            <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#E8E0FF] to-[#CBB9FF] p-6 text-center">
              <span aria-hidden="true" className="text-5xl">
                {kategoriDari(db, kelas?.idKategori)?.ikon ?? '📘'}
              </span>
              <p className="text-base font-semibold text-[#24252C]">{p.judul}</p>
              <p className="text-xs text-[#5F33E1]">Video segera hadir. Baca ringkasan materi di bawah, ya.</p>
            </div>
          ) : gagalPutar || offline ? (
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
              src={p.urlVideo}
              controls
              autoPlay
              playsInline
              className="aspect-[16/9] w-full bg-black"
              onError={() => setGagalPutar(true)}
              onEnded={() => query.belajar && !sudahSelesai && selesai()}
            />
          ) : (
            <button type="button" aria-label={`Putar video ${p.judul}`} onClick={() => setPutar(true)} className="flex aspect-[16/9] w-full items-center justify-center">
              <MdPlayArrow className="size-24 text-white" />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-xl text-[#24252C]">{p.judul}</h2>
            <p className="text-xs font-medium tracking-wide text-[#24252C] uppercase">
              {String(urutan).padStart(2, '0')} / {String(daftar.length).padStart(2, '0')} | {kelas?.nama}
            </p>
          </div>
          <div className="flex shrink-0 items-center rounded-full bg-[#F2F4F5] px-3 py-1.5 text-xs font-semibold text-[#24252C]">
            <button type="button" aria-label="Suka video" aria-pressed={nilaiSaya >= 4} disabled={!ikut} onClick={() => aksi.nilaiVideo(id, 5)} className={cn('flex items-center gap-1 pr-2', nilaiSaya >= 4 && 'text-[#5F33E1]')}>
              <TbThumbUp className="size-5" /> {suka}
            </button>
            <span className="h-4 w-px bg-[#C9CBD3]" />
            <button type="button" aria-label="Tidak suka video" aria-pressed={nilaiSaya > 0 && nilaiSaya <= 2} disabled={!ikut} onClick={() => aksi.nilaiVideo(id, 1)} className={cn('flex items-center gap-1 pl-2', nilaiSaya > 0 && nilaiSaya <= 2 && 'text-[#5F33E1]')}>
              <TbThumbDown className="size-5" /> {tidakSuka}
            </button>
          </div>
        </div>

        {p.deskripsi && (
          <div className="mt-4 rounded-2xl bg-[#F5F1FF] p-4">
            <p className="text-xs font-semibold tracking-wide text-[#5F33E1] uppercase">Ringkasan Materi</p>
            <p className="mt-1 text-sm leading-relaxed text-[#24252C]">{p.deskripsi}</p>
          </div>
        )}

        {query.belajar && ikut && (
          <Button className="mt-4 w-full py-3 text-sm" loading={menyimpan} disabled={sudahSelesai} onClick={selesai}>
            {sudahSelesai ? (
              <>
                <MdCheckCircle className="size-5" /> Sudah selesai
              </>
            ) : (
              'Tandai Selesai & Simpan Progres'
            )}
          </Button>
        )}
        {query.pratinjau && !ikut && (
          <Button variant="outline" className="mt-4 w-full py-3 text-sm" onClick={() => navigate(`/kelas/${p.idKelas}`, { replace: true })}>
            Kembali ke Gambaran Kelas
          </Button>
        )}
      </div>

      <section data-testid="panel-sinau-bot" className="mt-6 rounded-t-[2rem] bg-white px-6 pt-4 pb-4 shadow-[0_-10px_30px_rgba(36,37,44,0.06)]">
        <div className="mx-auto h-1.5 w-16 rounded-full bg-[#CBB9FF]" />
        <div className="mt-5">
          <BotHeader />
        </div>
        <p className="mt-4 text-center text-xs text-[#6E6A7C]">{jam}</p>
        <div className="mt-3 space-y-4">
          <ChatBubble dari="bot">{botGreeting(u?.nama)}</ChatBubble>
          {SARAN_PERTANYAAN.map((s) => (
            <ChatBubble key={s} dari="saran" onClick={() => tanya(s)}>
              {s}
            </ChatBubble>
          ))}
        </div>
      </section>
      <MessageInput onKirim={tanya} />
    </Screen>
  )
}
