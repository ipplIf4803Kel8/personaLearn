import { useState } from 'react'
import { Screen } from '@/components/pelajar/Screen'
import { Loading, ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { selesaikanTantangan } from '@/data/learningApi'
import { useTantangan } from '@/hooks/useTantangan'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'


// UC3-L08 Soal Tantangan. Server belum menyimpan butir soal, jadi pelajar mengerjakan tugas
// tantangan lalu mengonfirmasi bahwa sudah selesai.
export function SoalTantanganPage() {
  const { navigate } = useRouter()
  const toast = useToast()
  const { memuat, gagal, ulangi, tantangan: t } = useTantangan()
  const [yakin, setYakin] = useState(false)
  const [loading, setLoading] = useState(false)

  async function kirim() {
    setLoading(true)
    try {
      const r = await selesaikanTantangan(t.id)
      navigate(`/tantangan/selesai?poin=${r.pointsEarned}&judul=${encodeURIComponent(t.title)}`, { replace: true })
    } catch (e) {
      toast(e.message || 'Tantangan gagal diselesaikan. Coba lagi.', 'gagal')
      setLoading(false)
    }
  }

  return (
    <Screen kode="UC3-L08" back="/kelas-anda" title="Kerjakan Tantangan">
      {memuat ? (
        <Loading />
      ) : gagal ? (
        <ErrorState title="Tantangan gagal dimuat" onRetry={ulangi} />
      ) : !t || t.completed ? (
        <EmptyState title={t ? 'Tantangan ini sudah selesai' : 'Tantangan tidak ditemukan'} />
      ) : (
        <>
          <h1 className={cn('mt-4 text-lg font-semibold text-[#24252C]', HEADING_FONT)}>{t.title}</h1>
          <p className="mt-3 text-base text-[#6E6A7C]">{t.description || 'Kerjakan tantangan ini, lalu konfirmasi di bawah.'}</p>
          <button
            type="button"
            role="checkbox"
            aria-checked={yakin}
            onClick={() => setYakin(!yakin)}
            className={cn('mt-8 flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-base transition', yakin ? 'border-[#5F33E1] bg-[#F5F1FF] text-[#5F33E1]' : 'border-[#E6E6EA] bg-white text-[#24252C]')}
          >
            <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold', yakin ? 'border-[#5F33E1] bg-[#5F33E1] text-white' : 'border-[#C9CBD3]')}>{yakin ? 'v' : ''}</span>
            Saya sudah menyelesaikan tantangan ini
          </button>
          <Button className="mt-8 w-full" disabled={!yakin} loading={loading} onClick={kirim}>
            Selesaikan Tantangan
          </Button>
        </>
      )}
    </Screen>
  )
}
