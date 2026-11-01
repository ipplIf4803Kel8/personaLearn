import { useEffect, useRef, useState } from 'react'
import { MdErrorOutline } from 'react-icons/md'
import { TbRobot } from 'react-icons/tb'
import { useParams } from 'react-router'
import { Screen } from '@/components/pelajar/Screen'
import { ChatBubble, MessageInput, BotHeader, botGreeting, formatChatTime } from '@/components/pelajar/Chat'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { penggunaAktif, useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC6-L03 Obrolan Sinau Bot (+ UC6-L04 Tawaran One-to-One; kondisi C: pesan gagal terkirim)
export function ObrolanSinauBotPage() {
  const params = useParams()
  const { navigate, query } = useRouter()
  const { db, aksi } = useDb()
  const id = Number(params.id)
  const u = penggunaAktif(db)
  const p = db.pelajaran.find((x) => x.id === id)
  const riwayat = db.riwayatObrolan.filter((o) => o.idPengguna === u?.id && o.idPelajaran === id)
  const [gagal, setGagal] = useState(null)
  const [mengetik, setMengetik] = useState(false)
  const [tawaran, setTawaran] = useState(false)
  const [jam] = useState(() => formatChatTime())
  const bawah = useRef(null)
  const sudahKirimAwal = useRef(false)

  async function kirim(teks) {
    setGagal(null)
    setMengetik(true)
    try {
      const r = await aksi.tanyaSinauBot(id, teks)
      if (r.kesulitan) setTawaran(true)
    } catch {
      setGagal(teks)
    } finally {
      setMengetik(false)
    }
  }

  useEffect(() => {
    if (query.q && !sudahKirimAwal.current) {
      sudahKirimAwal.current = true
      kirim(query.q)
      navigate(`/obrolan/${id}`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    bawah.current?.scrollIntoView({ block: 'end' })
  }, [riwayat.length, mengetik, gagal])

  return (
    <Screen kode="UC6-L03" back title="Obrolan" bell className="pb-28">
      <BotHeader />
      <p className="mt-4 text-center text-xs text-[#6E6A7C]">{jam}</p>
      <p className="sr-only">Materi: {p?.judul}</p>
      <div className="mt-3 space-y-4">
        <ChatBubble dari="bot">{botGreeting(u?.nama)}</ChatBubble>
        {riwayat.map((o) => (
          <ChatBubble key={o.id} dari={o.pengirim === 'bot' ? 'bot' : 'pelajar'}>
            {o.pesan}
          </ChatBubble>
        ))}
        {gagal && (
          <div className="flex flex-col items-end gap-1">
            <div className="max-w-[85%] rounded-3xl bg-[#E6E6EA] px-5 py-3 text-base text-[#6E6A7C]">{gagal}</div>
            <button type="button" onClick={() => kirim(gagal)} className="flex items-center gap-1 text-xs font-medium text-[#C8303C]">
              <MdErrorOutline /> Pesan gagal terkirim · Kirim ulang
            </button>
          </div>
        )}
        {mengetik && (
          <div className="flex items-center gap-3 text-sm text-[#8A8A94]">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#EEE9FF] text-[#5F33E1]">
              <TbRobot className="size-5" />
            </span>
            Sinau Bot sedang mengetik...
          </div>
        )}
        <div ref={bawah} />
      </div>
      <MessageInput onKirim={kirim} disabled={mengetik} />

      <BottomSheet open={tawaran} onClose={() => setTawaran(false)} center kode="UC6-L04">
        <div className="text-center">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#EEE9FF] text-[#5F33E1]">
            <TbRobot className="size-11" />
          </span>
          <h2 className={cn('mt-4 text-xl font-semibold text-[#5F33E1]', HEADING_FONT)}>Butuh bantuan lebih?</h2>
          <p className="mt-3 text-base text-[#24252C]">Sinau Bot melihat Anda kesulitan di materi {p?.judul}. Mau belajar One-to-One dengan AI?</p>
          <Button className="mt-6 w-full py-3.5" onClick={() => navigate(`/one-to-one/${id}`)}>
            Ya, Bantu Saya
          </Button>
          <Button variant="outline" className="mt-3 w-full py-3.5 font-normal" onClick={() => setTawaran(false)}>
            Nanti Saja
          </Button>
        </div>
      </BottomSheet>
    </Screen>
  )
}
