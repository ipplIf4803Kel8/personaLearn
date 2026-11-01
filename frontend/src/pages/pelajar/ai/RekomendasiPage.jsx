import { CourseCard } from '@/components/pelajar/CourseCard'
import { Screen } from '@/components/pelajar/Screen'
import { Loading, ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { useDb } from '@/data/db'
import { useAsync } from '@/hooks/useAsync'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC6-L01 Rekomendasi Untukmu (kondisi A: MBTI belum diisi, C: gagal memuat)
export function RekomendasiPage() {
  const { navigate } = useRouter()
  const { aksi } = useDb()
  const rek = useAsync(() => aksi.rekomendasi(), [])
  return (
    <Screen kode="UC6-L01" back title="Rekomendasi Untukmu" bell nav>
      {rek.memuat ? (
        <Loading label="Sistem AI menyusun rekomendasi..." />
      ) : rek.gagal ? (
        <ErrorState title="Rekomendasi gagal dimuat" onRetry={rek.ulangi} />
      ) : (
        <>
          {rek.data.kelompok ? (
            <div className="rounded-3xl bg-gradient-to-r from-[#EEE9FF] to-[#E2D9FF] p-5">
              <p className="text-sm font-medium text-[#5F33E1]">Berdasarkan tipe {rek.data.tipe}</p>
              <p className={cn('mt-1 text-lg font-semibold text-[#24252C]', HEADING_FONT)}>Gaya belajar {rek.data.kelompok.id}</p>
              <p className="mt-1 text-sm text-[#6E6A7C]">Kelas dengan konten {rek.data.kelompok.tag.toLowerCase()} yang cocok untukmu.</p>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#FFF7E6] p-5">
              <p className={cn('text-base font-semibold text-[#24252C]', HEADING_FONT)}>Isi tipe MBTI-mu agar rekomendasi lebih pas</p>
              <p className="mt-1 text-sm text-[#6E6A7C]">Sementara ini kami tampilkan kelas populer dan kelas yang mirip dengan yang kamu ikuti.</p>
              <Button className="mt-4 px-5 py-3 text-sm" onClick={() => navigate('/profil/ubah')}>
                Isi Sekarang
              </Button>
            </div>
          )}
          <div className="mt-6 space-y-4">
            {rek.data.kelas.length === 0 ? (
              <EmptyState title="Belum ada kelas yang cocok" desc="Admin belum memberi tag kelas untuk kelompok ini." />
            ) : (
              rek.data.kelas.map((k) => <CourseCard key={k.id} kelas={k} />)
            )}
          </div>
        </>
      )}
    </Screen>
  )
}
