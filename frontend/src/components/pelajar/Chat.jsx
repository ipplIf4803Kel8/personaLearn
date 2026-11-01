import { useState } from 'react'
import { TbMicrophone, TbRobot, TbSend } from 'react-icons/tb'
import { useToast } from '@/components/pelajar/Toast'
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
export function MessageInput({ onKirim, disabled }) {
  const [teks, setTeks] = useState('')
  const toast = useToast()
  const suara = useSpeechInput((t) => setTeks(t))
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!teks.trim()) return
        onKirim(teks.trim())
        setTeks('')
      }}
      className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center gap-4 bg-white/95 px-6 pt-3 pb-6 backdrop-blur"
    >
      <label className="flex min-w-0 flex-1 items-center rounded-full border-2 border-[#C9CBD3] bg-white pr-3 pl-6">
        <input value={teks} onChange={(e) => setTeks(e.target.value)} placeholder="Tulis Pesan ...." aria-label="Pesan untuk Sinau Bot" className="min-w-0 flex-1 bg-transparent py-3.5 text-base outline-none placeholder:text-[#8A8A94]" />
        <button
          type="button"
          aria-label="Input suara"
          onClick={() => !suara.mulai() && toast('Input suara belum didukung browser ini.', 'gagal')}
          className={cn('flex size-10 items-center justify-center rounded-full', suara.mendengar ? 'bg-rose-100 text-rose-500' : 'text-[#6E6A7C]')}
        >
          <TbMicrophone className="size-7" />
        </button>
      </label>
      <button type="submit" disabled={disabled || !teks.trim()} aria-label="Kirim" className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#5F33E1] text-white disabled:cursor-not-allowed">
        <TbSend className="size-7" />
      </button>
    </form>
  )
}
