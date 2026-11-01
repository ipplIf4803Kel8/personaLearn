import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { Screen } from '@/components/pelajar/Screen'
import { ChatBubble, MessageInput, BotHeader, formatChatTime } from '@/components/pelajar/Chat'
import { Loading, ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { useDb } from '@/data/db'
import { useAsync } from '@/hooks/useAsync'
import { useRouter } from '@/lib/router'

// UC6-L05 Sesi One-to-One (kondisi C: sesi terputus)
export function SesiOneToOnePage() {
  const params = useParams()
  const { navigate } = useRouter()
  const { db } = useDb()
  const id = Number(params.id)
  const p = db.pelajaran.find((x) => x.id === id)
  const [n, setN] = useState(0)
  const [langkah, setLangkah] = useState(0)
  const [pesan, setPesan] = useState([])
  const [jam] = useState(() => formatChatTime())
  const bawah = useRef(null)
  const sesi = useAsync(async () => {
    await new Promise((r) => setTimeout(r, 500))
    if (db.simulasi.koneksi) throw new Error('terputus')
    return true
  }, [n], { simpan: false })
  useEffect(() => {
    bawah.current?.scrollIntoView({ block: 'end' })
  }, [pesan.length])
  if (!p)
    return (
      <Screen back title="One-to-One">
        <EmptyState title="Materi tidak ditemukan" />
      </Screen>
    )
  const kalimat = p.deskripsi.split(/(?<=\.)\s+/).filter(Boolean)
  const daftar = [
    `Kita mulai dari judul materinya: "${p.judul}". Bayangkan apa yang ingin Anda capai setelah memahami materi ini.`,
    ...kalimat.map((k, i) => `Langkah ${i + 1}: ${k}`),
    'Sekarang coba jelaskan kembali dengan kata-kata Anda sendiri, lalu kerjakan satu contoh kecil.',
    'Bagus! Jika masih ragu, ulangi video pada bagian yang membingungkan dan tanyakan ke Sinau Bot.',
  ]
  const habis = langkah >= daftar.length - 1

  function lanjut(teksPelajar) {
    if (habis) return
    const berikut = langkah + 1
    setPesan((m) => [...m, { dari: 'pelajar', teks: teksPelajar }, { dari: 'bot', teks: (teksPelajar.endsWith('?') ? 'Pertanyaan bagus! ' : 'Tidak masalah! ') + daftar[berikut] }])
    setLangkah(berikut)
  }

  return (
    <Screen kode="UC6-L05" back title="One-to-One" bell className="pb-28">
      {sesi.memuat ? (
        <Loading label="Menyambungkan sesi..." />
      ) : sesi.gagal ? (
        <ErrorState title="Sesi terputus" desc="Koneksi ke Sinau Bot terputus." label="Sambungkan ulang" onRetry={() => setN((x) => x + 1)} />
      ) : (
        <>
          <BotHeader />
          <p className="mt-4 text-center text-xs text-[#6E6A7C]">{jam}</p>
          <div className="mt-3 space-y-4">
            <ChatBubble dari="bot">Sesi One-to-One dimulai. Saya Sinau Bot siap membantu Anda memahami materi ini langkah demi langkah.</ChatBubble>
            <ChatBubble dari="bot">{daftar[0]}</ChatBubble>
            {pesan.map((m, i) => (
              <ChatBubble key={i} dari={m.dari}>
                {m.teks}
              </ChatBubble>
            ))}
            {habis ? (
              <ChatBubble dari="saran" onClick={() => navigate(`/video/${id}?belajar=1`, { replace: true })}>
                Selesai, kembali ke video
              </ChatBubble>
            ) : (
              <ChatBubble dari="saran" onClick={() => lanjut('Lanjut ke langkah berikutnya')}>
                Lanjut ke langkah berikutnya ({langkah + 1}/{daftar.length})
              </ChatBubble>
            )}
            <div ref={bawah} />
          </div>
          <MessageInput onKirim={lanjut} disabled={habis} />
        </>
      )}
    </Screen>
  )
}
