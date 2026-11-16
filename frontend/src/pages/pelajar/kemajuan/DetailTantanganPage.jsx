import { MdEmojiEvents } from 'react-icons/md'
import { Screen } from '@/components/pelajar/Screen'
import { Loading, ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { useTantangan } from '@/hooks/useTantangan'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC3-L06 Detail Tantangan
export function DetailTantanganPage() {
  const { navigate } = useRouter()
  const { memuat, gagal, ulangi, tantangan: t } = useTantangan()
  return (
    <Screen kode="UC3-L06" back title="Tantangan" bell>
      {memuat ? (
        <Loading />
      ) : gagal ? (
        <ErrorState title="Tantangan gagal dimuat" onRetry={ulangi} />
      ) : !t ? (
        <EmptyState title="Belum ada tantangan" desc="Tantangan baru akan muncul di sini." />
      ) : (
        <>
          <div className="mt-2 rounded-3xl bg-white p-6 text-center shadow-[0_8px_28px_rgba(36,37,44,0.08)]">
            <span className="mx-auto flex size-24 items-center justify-center rounded-full bg-[#FFF3E0] text-[#F59E0B]">
              <MdEmojiEvents className="size-14" />
            </span>
            <h1 className={cn('mt-5 text-xl font-semibold text-[#24252C]', HEADING_FONT)}>{t.title}</h1>
            {t.description && <p className="mt-2 text-base text-[#6E6A7C]">{t.description}</p>}
            <div className="mt-5 flex justify-center gap-3">
              <span className="rounded-xl bg-[#EEE9FF] px-4 py-2 text-base text-[#5F33E1]">+{t.rewardPoints} poin</span>
              <span className="rounded-xl bg-[#EEE9FF] px-4 py-2 text-base text-[#5F33E1]">Sampai {new Date(t.endsAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
            </div>
          </div>
          {t.completed ? (
            <p className="mt-8 rounded-full bg-[#E8F7EE] py-3 text-center font-medium text-[#1E7A46]">Sudah selesai</p>
          ) : (
            <Button className="mt-8 w-full" onClick={() => navigate(`/tantangan/soal?id=${t.id}`, { replace: true })}>
              Mulai
            </Button>
          )}
        </>
      )}
    </Screen>
  )
}
