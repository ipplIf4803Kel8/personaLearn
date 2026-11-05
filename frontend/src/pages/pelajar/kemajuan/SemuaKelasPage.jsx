import { PointsBar } from '@/components/pelajar/PointsBar'
import { CourseThumbnail } from '@/components/pelajar/CourseCard'
import { Screen } from '@/components/pelajar/Screen'
import { ProgressRing } from '@/components/pelajar/Progress'
import { EmptyState } from '@/components/pelajar/DataState'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { kategoriDari, kelasDiikutiSaya, useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC3-L04 Semua Kelas
export function SemuaKelasPage() {
  const { navigate } = useRouter()
  const { db } = useDb()
  const kelas = kelasDiikutiSaya(db).filter((k) => k.kelas.status !== 'disembunyikan')
  return (
    <Screen kode="UC3-L04" back title="Daftar Kelas Anda" bell nav>
      <PointsBar />
      {kelas.length === 0 ? (
        <EmptyState title="Belum ada kelas yang diikuti" action={<Button className="py-3" onClick={() => navigate('/cari')}>Cari Kelas</Button>} />
      ) : (
        <div className="mt-4 space-y-4">
          {kelas.map((k) => (
            <button
              key={k.idKelas}
              type="button"
              onClick={() => navigate(`/belajar/${k.idKelas}`)}
              className="flex w-full items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-[0_8px_28px_rgba(36,37,44,0.08)]"
            >
              <CourseThumbnail kelas={k.kelas} className="size-14 shrink-0 rounded-full text-xl" />
              <div className="min-w-0 flex-1">
                <p className={cn('truncate text-base font-semibold text-[#24252C]', HEADING_FONT)}>{kategoriDari(db, k.kelas.idKategori)?.nama}</p>
                <p className="truncate text-sm text-[#6E6A7C]">{k.kelas.nama}</p>
              </div>
              <ProgressRing value={k.progres} size={48} stroke={4} labelClass="text-xs" />
            </button>
          ))}
        </div>
      )}
    </Screen>
  )
}
