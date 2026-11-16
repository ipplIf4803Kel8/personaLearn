import { CourseCard } from '@/components/pelajar/CourseCard'
import { Screen } from '@/components/pelajar/Screen'
import { Loading, ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { kelasPopuler } from '@/data/courseApi'
import { useAsync } from '@/hooks/useAsync'

// UC2-L06 Pelajaran Populer
export function PelajaranPopulerPage() {
  const populer = useAsync(() => kelasPopuler(30), []) // data dari backend
  return (
    <Screen kode="UC2-L06" back title="Pelajaran Populer" nav>
      <div className="mt-2 space-y-4">
        {populer.memuat ? <Loading /> : populer.gagal ? <ErrorState onRetry={populer.ulangi} /> : populer.data.length === 0 ? <EmptyState title="Belum ada kelas populer" desc="Kelas akan muncul di sini setelah ada yang mengambilnya." /> : populer.data.map((k) => <CourseCard key={k.id} kelas={k} />)}
      </div>
    </Screen>
  )
}
