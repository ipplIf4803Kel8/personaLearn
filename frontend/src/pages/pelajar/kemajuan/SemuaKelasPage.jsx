import { PointsBar } from '@/components/pelajar/PointsBar'
import { CourseThumbnail } from '@/components/pelajar/CourseCard'
import { Screen } from '@/components/pelajar/Screen'
import { ProgressRing } from '@/components/pelajar/Progress'
import { Loading, ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { muatKelasSaya } from '@/data/learningApi'
import { useAsync } from '@/hooks/useAsync'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC3-L04 Semua Kelas
export function SemuaKelasPage() {
  const { navigate } = useRouter()
  const muat = useAsync(muatKelasSaya, [])
  const kelas = muat.data ?? []
  return (
    <Screen kode="UC3-L04" back title="Daftar Kelas Anda" bell nav>
      <PointsBar />
      {muat.memuat ? (
        <Loading />
      ) : muat.gagal ? (
        <ErrorState title="Daftar kelas gagal dimuat" onRetry={muat.ulangi} />
      ) : kelas.length === 0 ? (
        <EmptyState title="Belum ada kelas yang diikuti" action={<Button className="py-3" onClick={() => navigate('/cari')}>Cari Kelas</Button>} />
      ) : (
        <div className="mt-4 space-y-4">
          {kelas.map((k) => (
            <button
              key={k.courseId}
              type="button"
              onClick={() => navigate(`/belajar/${k.courseId}`)}
              className="flex w-full items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-[0_8px_28px_rgba(36,37,44,0.08)]"
            >
              <CourseThumbnail kelas={{ gambar: k.thumbnailUrl }} className="size-14 shrink-0 rounded-full text-xl" />
              <div className="min-w-0 flex-1">
                <p className={cn('truncate text-base font-semibold text-[#24252C]', HEADING_FONT)}>{k.categoryName}</p>
                <p className="truncate text-sm text-[#6E6A7C]">{k.title}</p>
              </div>
              <ProgressRing value={k.progressPercent} size={48} stroke={4} labelClass="text-xs" />
            </button>
          ))}
        </div>
      )}
    </Screen>
  )
}
