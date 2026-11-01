import { MdEmojiEvents } from 'react-icons/md'
import { Screen } from '@/components/pelajar/Screen'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC3-L06 Detail Tantangan
export function DetailTantanganPage() {
  const { navigate } = useRouter()
  const { db } = useDb()
  const t = db.tantangan[0]
  return (
    <Screen kode="UC3-L06" back title="Tantangan" bell>
      <div className="mt-2 rounded-3xl bg-white p-6 text-center shadow-[0_8px_28px_rgba(36,37,44,0.08)]">
        <span className="mx-auto flex size-24 items-center justify-center rounded-full bg-[#FFF3E0] text-[#F59E0B]">
          <MdEmojiEvents className="size-14" />
        </span>
        <h1 className={cn('mt-5 text-xl font-semibold text-[#24252C]', HEADING_FONT)}>{t.judul.replace('Tantangan Minggu Ini: ', '')}</h1>
        <p className="mt-2 text-base text-[#6E6A7C]">Jawab {t.soal.length} soal dari materi minggu ini.</p>
        <div className="mt-5 flex justify-center gap-3">
          <span className="rounded-xl bg-[#EEE9FF] px-4 py-2 text-base text-[#5F33E1]">+{t.hadiahPoin} poin</span>
          <span className="rounded-xl bg-[#EEE9FF] px-4 py-2 text-base text-[#5F33E1]">{t.soal.length} soal</span>
        </div>
      </div>
      <Button className="mt-8 w-full" onClick={() => navigate('/tantangan/soal', { replace: true })}>
        Mulai
      </Button>
    </Screen>
  )
}
