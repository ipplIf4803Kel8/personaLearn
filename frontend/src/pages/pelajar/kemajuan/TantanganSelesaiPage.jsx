import { MdEmojiEvents } from 'react-icons/md'
import { Screen } from '@/components/pelajar/Screen'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC3-L09 Tantangan Selesai
export function TantanganSelesaiPage() {
  const { navigate, query } = useRouter()
  const { db } = useDb()
  const t = db.tantangan[0]
  return (
    <Screen kode="UC3-L09" header={false}>
      <div className="flex min-h-[90vh] flex-col items-center justify-center text-center">
        <div className="flex size-32 items-center justify-center rounded-full bg-[#FFF0C2] text-[#FFC71E]">
          <MdEmojiEvents className="size-20" />
        </div>
        <h1 className={cn('mt-8 text-2xl font-semibold text-[#24252C]', HEADING_FONT)}>Tantangan Selesai!</h1>
        <p className="mt-3 text-base text-[#6E6A7C]">
          Jawaban benar <strong>{query.benar}</strong> dari {t.soal.length} soal.
        </p>
        {Number(query.poin) > 0 && <p className="mt-4 rounded-xl bg-[#EEE9FF] px-5 py-2 text-base text-[#5F33E1]">+{query.poin} poin</p>}
        <Button className="mt-10 w-full" onClick={() => navigate('/kelas-anda', { replace: true })}>
          Kembali ke Daftar Kelas
        </Button>
      </div>
    </Screen>
  )
}
