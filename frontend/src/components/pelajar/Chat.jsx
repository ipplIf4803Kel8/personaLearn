import { useCallback, useEffect, useRef, useState } from 'react'
import { TbMicrophone, TbRobot, TbSend } from 'react-icons/tb'
import { useToast } from '@/components/pelajar/Toast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export function BotAvatar({ className = 'size-12', ikon = 'size-7' }) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-[#EEE9FF] text-[#5F33E1]', className)}>
      <TbRobot className={ikon} />
    </span>
  )
}

export function BotHeader() {
  return (
    <div className="flex items-center gap-4">
      <BotAvatar className="size-14" ikon="size-8" />
      <div>
        <p className="text-base font-bold text-[#24252C]">Sinau Bot</p>
        <p className="flex items-center gap-1.5 text-sm text-[#6E6A7C]">
          <span className="size-2.5 rounded-full bg-[#22C55E]" /> Selalu Aktif
        </p>
      </div>
    </div>
  )
}

/** Gelembung obrolan: dari 'bot' (abu-abu, kiri), 'pelajar' (ungu, kanan), atau 'saran' (lavender). */
export function ChatBubble({ dari = 'bot', children, onClick, className }) {
  if (dari === 'bot')
    return (
      <div className={cn('flex items-start gap-3', className)}>
        <BotAvatar className="mt-1 size-10" ikon="size-5" />
        <div className="max-w-[85%] rounded-3xl bg-[#F2F4F5] px-5 py-4 text-base leading-relaxed whitespace-pre-line text-[#24252C]">{children}</div>
      </div>
    )
  if (dari === 'saran')
    return (
      <div className={cn('flex justify-end', className)}>
        <button type="button" onClick={onClick} className="max-w-[85%] rounded-3xl bg-[#F0EAFF] px-5 py-3 text-left text-base leading-relaxed text-[#5F33E1]">
          {children}
        </button>
      </div>
    )
  return (
    <div className={cn('flex justify-end', className)}>
      <div className="max-w-[85%] rounded-3xl bg-[#5F33E1] px-5 py-3 text-base leading-relaxed text-white">{children}</div>
    </div>
  )
}

export function formatChatTime(d = new Date()) {
  return `${d.toLocaleDateString('id-ID', { weekday: 'short' })} ${d.toLocaleTimeString('id-ID', { hour: 'numeric', minute: '2-digit' }).replace('.', ':')} WIB`
}

export function botGreeting(nama) {
  return `Hallo ${nama?.split(' ')[0] ?? ''}, Saya Sinau Bot! 👋 Saya adalah asisten pribadi anda yang siap membantu.`
}

export function useSpeechInput(onHasil) {
  const Rec = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
  const [mendengar, setMendengar] = useState(false)
  function mulai() {
    if (!Rec) return false
    const r = new Rec()
    r.lang = 'id-ID'
    r.onresult = (e) => onHasil(e.results[0][0].transcript)
    r.onend = () => setMendengar(false)
    setMendengar(true)
    r.start()
    return true
  }
  return { didukung: !!Rec, mendengar, mulai }
}

/** Kolom "Tulis Pesan ...." + tombol kirim bulat, menempel di bawah layar (seperti Figma). */
export const BATAS_PESAN = 1000

export function MessageInput({ onKirim, disabled, tertanam = false }) {
  const [teks, setTeks] = useState('')
  const toast = useToast()
  const suara = useSpeechInput((t) => setTeks(t))
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!teks.trim() || teks.length > BATAS_PESAN) return
        onKirim(teks.trim())
        setTeks('')
      }}
      className={cn('flex flex-wrap items-center gap-x-4 bg-white/95 backdrop-blur', tertanam ? 'pt-3' : 'fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 px-6 pt-3 pb-6')}
    >
      <label className="flex min-w-0 flex-1 items-center rounded-full border-2 border-[#C9CBD3] bg-white pr-3 pl-6">
        <input value={teks} aria-invalid={teks.length > BATAS_PESAN} onChange={(e) => setTeks(e.target.value)} placeholder="Tulis Pesan ...." aria-label="Pesan untuk Sinau Bot" className="min-w-0 flex-1 bg-transparent py-3.5 text-base outline-none placeholder:text-subtle" />
        <button
          type="button"
          aria-label="Input suara"
          onClick={() => !suara.mulai() && toast('Input suara belum didukung browser ini.', 'gagal')}
          className={cn('flex size-10 items-center justify-center rounded-full', suara.mendengar ? 'bg-rose-100 text-rose-500' : 'text-[#6E6A7C]')}
        >
          <TbMicrophone className="size-7" />
        </button>
      </label>
      <button type="submit" disabled={disabled || !teks.trim() || teks.length > BATAS_PESAN} aria-label="Kirim" className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#5F33E1] text-white disabled:cursor-not-allowed">
        <TbSend className="size-7" />
      </button>
      {teks.length > 800 && (
        <p role="status" className={cn('basis-full pt-1 pl-6 text-xs', teks.length > BATAS_PESAN ? 'font-medium text-[#C8303C]' : 'text-subtle')}>
          {teks.length}/{BATAS_PESAN}
          {teks.length > BATAS_PESAN && ` - pesan terlalu panjang, kurangi ${teks.length - BATAS_PESAN} karakter`}
        </p>
      )}
    </form>
  )
}

function Skeleton() {
  return (
    <div className="space-y-4" aria-label="Memuat riwayat obrolan">
      <div className="h-16 w-3/4 animate-pulse rounded-3xl bg-[#F2F4F5]" />
      <div className="ml-auto h-10 w-1/2 animate-pulse rounded-3xl bg-[#EEE9FF]" />
      <div className="h-20 w-4/5 animate-pulse rounded-3xl bg-[#F2F4F5]" />
    </div>
  )
}

function Stamp({ at, kanan }) {
  return <p className={cn('mt-1 text-xs text-subtle', kanan ? 'text-right' : 'pl-[52px]')}>{formatChatTime(new Date(at))}</p>
}

/**
 * Obrolan dengan Sinau Bot yang tersambung ke backend (GET/POST /chat/messages).
 * Isi pesan ditampilkan sebagai teks biasa (React meng-escape), tanpa HTML mentah.
 *
 * Props:
 * - lessonId   : id pelajaran sebagai konteks bot; kosong berarti obrolan umum
 * - nama       : nama pelajar untuk sapaan pembuka (opsional)
 * - tertanam   : true bila dipasang di dalam halaman lain (mis. panel di bawah video); kolom input tidak menempel di dasar layar
 * - pesanAwal  : pesan yang dikirim otomatis sekali saat dibuka (opsional)
 * - awalHanyaJikaKosong : kirim pesanAwal hanya bila belum ada riwayat
 */
export function Chat({ lessonId, nama, tertanam = false, pesanAwal, awalHanyaJikaKosong = false }) {
  const [pesan, setPesan] = useState([])
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState(null)
  const [adaLagi, setAdaLagi] = useState(false)
  const [mengetik, setMengetik] = useState(false)
  const [gagalKirim, setGagalKirim] = useState([]) // pesan yang gagal terkirim, satu entri per pesan
  const bawah = useRef(null)
  const daftarRef = useRef(null)
  const awalDikirim = useRef(false)
  const dasar = lessonId ? `/chat/messages?lessonId=${lessonId}` : '/chat/messages?'

  const muat = useCallback(async () => {
    setMemuat(true)
    setGalat(null)
    try {
      const { data } = await api(`${dasar}&limit=30`)
      setPesan(data.messages)
      setAdaLagi(data.hasMore)
      return data.messages
    } catch (e) {
      setGalat(e.message)
      return null
    } finally {
      setMemuat(false)
    }
  }, [dasar])

  async function muatLama() {
    try {
      const { data } = await api(`${dasar}&limit=30&before=${pesan[0].id}`)
      setPesan((p) => [...data.messages, ...p])
      setAdaLagi(data.hasMore)
    } catch (e) {
      setGalat(e.message)
    }
  }

  const kirim = useCallback(
    async (teks) => {
      setMengetik(true)
      const sementara = { id: `tmp-${Date.now()}`, sender: 'user', content: teks, createdAt: new Date().toISOString() }
      setPesan((p) => [...p, sementara])
      try {
        const { data } = await api('/chat/messages', { method: 'POST', body: { content: teks, lessonId: lessonId ? Number(lessonId) : null } })
        setPesan((p) => [...p.filter((m) => m.id !== sementara.id), data.userMessage, data.botMessage])
      } catch (e) {
        setPesan((p) => p.filter((m) => m.id !== sementara.id))
        setGagalKirim((g) => [...g, { id: sementara.id, teks, alasan: e.message }])
      } finally {
        setMengetik(false)
      }
    },
    [lessonId],
  )

  useEffect(() => {
    muat().then((riwayat) => {
      if (!pesanAwal || awalDikirim.current || !riwayat) return
      if (awalHanyaJikaKosong && riwayat.length) return
      awalDikirim.current = true
      kirim(pesanAwal)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muat])

  // Gulir ke pesan terbaru hanya saat ada perubahan setelah muat awal. Mode tertanam menggulir kontainer pesan saja, bukan halaman.
  const awalMuat = useRef(true)
  useEffect(() => {
    if (memuat) return
    if (awalMuat.current) {
      awalMuat.current = false
      if (tertanam) return
    }
    const el = bawah.current
    if (!el) return
    if (tertanam) daftarRef.current.scrollTop = daftarRef.current.scrollHeight
    else el.scrollIntoView({ block: 'end' })
  }, [memuat, pesan.length, mengetik, gagalKirim.length, tertanam])

  return (
    <div>
      {memuat ? (
        <Skeleton />
      ) : galat ? (
        <div role="alert" className="rounded-2xl bg-[#FDECEE] px-4 py-3 text-sm text-[#C8303C]">
          {galat}{' '}
          <button type="button" onClick={muat} className="font-semibold underline">
            Coba lagi
          </button>
        </div>
      ) : (
        <div ref={daftarRef} className={cn('space-y-4', tertanam && 'max-h-96 overflow-y-auto')}>
          {adaLagi && (
            <button type="button" onClick={muatLama} className="mx-auto block text-sm font-medium text-[#5F33E1]">
              Muat pesan sebelumnya
            </button>
          )}
          <ChatBubble dari="bot">{botGreeting(nama)}</ChatBubble>
          {pesan.map((m) => (
            <div key={m.id}>
              <ChatBubble dari={m.sender === 'bot' ? 'bot' : 'pelajar'}>{m.content}</ChatBubble>
              <Stamp at={m.createdAt} kanan={m.sender !== 'bot'} />
            </div>
          ))}
          {gagalKirim.map((g) => (
            <div key={g.id} className="flex flex-col items-end gap-1">
              <div className="max-w-[85%] rounded-3xl bg-[#E6E6EA] px-5 py-3 text-base break-words text-[#6E6A7C]">{g.teks}</div>
              <button
                type="button"
                disabled={mengetik}
                onClick={() => {
                  setGagalKirim((l) => l.filter((x) => x.id !== g.id))
                  kirim(g.teks)
                }}
                className="-mb-2 flex min-h-10 items-center text-xs font-medium text-[#C8303C]"
              >
                {g.alasan}. Kirim ulang
              </button>
            </div>
          ))}
          {mengetik && (
            <div className="flex items-center gap-3 text-sm text-subtle" role="status">
              <BotAvatar className="size-10" ikon="size-5" />
              Sinau Bot sedang mengetik...
            </div>
          )}
          <div ref={bawah} />
        </div>
      )}
      <MessageInput onKirim={kirim} disabled={mengetik || memuat} tertanam={tertanam} />
    </div>
  )
}
