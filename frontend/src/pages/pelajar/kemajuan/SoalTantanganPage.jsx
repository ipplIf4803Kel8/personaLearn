import { useState } from 'react'
import { Screen } from '@/components/pelajar/Screen'
import { ProgressBar } from '@/components/pelajar/Progress'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC3-L08 Soal Tantangan
export function SoalTantanganPage() {
  const { navigate } = useRouter()
  const { db, aksi } = useDb()
  const toast = useToast()
  const t = db.tantangan[0]
  const [no, setNo] = useState(0)
  const [pilih, setPilih] = useState(null)
  const [benar, setBenar] = useState(0)
  const [loading, setLoading] = useState(false)
  const soal = t.soal[no]

  async function kirim() {
    const total = benar + (pilih === soal.benar ? 1 : 0)
    if (no < t.soal.length - 1) {
      setBenar(total)
      setNo(no + 1)
      setPilih(null)
      return
    }
    setLoading(true)
    try {
      const r = await aksi.selesaikanTantangan(t.id, total)
      navigate(`/tantangan/selesai?benar=${total}&poin=${r.poin}`, { replace: true })
    } catch {
      toast('Jawaban gagal dikirim. Coba lagi.', 'gagal')
      setLoading(false)
    }
  }

  return (
    <Screen kode="UC3-L08" back="/kelas-anda" title="Soal Tantangan">
      <p className="text-sm font-medium text-[#5F33E1]">
        Soal {no + 1} dari {t.soal.length}
      </p>
      <ProgressBar value={((no + 1) / t.soal.length) * 100} className="mt-2" />
      <h1 className={cn('mt-6 text-lg font-semibold text-[#24252C]', HEADING_FONT)}>{soal.teks}</h1>
      <div className="mt-5 space-y-3" role="radiogroup">
        {soal.opsi.map((o, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={pilih === i}
            onClick={() => setPilih(i)}
            className={cn('flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-base transition', pilih === i ? 'border-[#5F33E1] bg-[#F5F1FF] text-[#5F33E1]' : 'border-[#E6E6EA] bg-white text-[#24252C]')}
          >
            <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold', pilih === i ? 'bg-[#5F33E1] text-white' : 'bg-[#F2F4F5]')}>{'ABCD'[i]}</span>
            {o}
          </button>
        ))}
      </div>
      <Button className="mt-8 w-full" disabled={pilih === null} loading={loading} onClick={kirim}>
        Kirim Jawaban
      </Button>
    </Screen>
  )
}
