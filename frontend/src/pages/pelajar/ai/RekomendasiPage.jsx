import { CourseCard } from '@/components/pelajar/CourseCard'
import { Screen } from '@/components/pelajar/Screen'
import { Loading, ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { kelasRekomendasi } from '@/data/courseApi'
import { useAsync } from '@/hooks/useAsync'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC6-L01 Rekomendasi Untukmu (kondisi A: MBTI belum diisi, C: gagal memuat)
export function RekomendasiPage() {
  const { navigate } = useRouter()
  const rek = useAsync(() => kelasRekomendasi(30), []) // dari engine rekomendasi di backend
  // Kelas hasil skoring membawa skor; daftar populer (tanpa preferensi) tidak.
  const personal = rek.data?.some((k) => k.skor !== undefined)
  return (
    <Screen kode="UC6-L01" back title="Rekomendasi Untukmu" bell nav>
      {rek.memuat ? (
        <Loading label="Sistem AI menyusun rekomendasi..." />
      ) : rek.gagal ? (
        <ErrorState title="Rekomendasi gagal dimuat" onRetry={rek.ulangi} />
      ) : (
        <>
          {personal ? (
            <div className="rounded-3xl bg-gradient-to-r from-[#EEE9FF] to-[#E2D9FF] p-5">
              <p className="text-sm font-medium text-[#5F33E1]">Berdasarkan preferensimu</p>
              <p className={cn('mt-1 text-lg font-semibold text-[#24252C]', HEADING_FONT)}>Dipilih sesuai gaya belajar dan kepribadianmu</p>
              <p className="mt-1 text-sm text-[#6E6A7C]">Kelas diurutkan dari yang paling cocok.</p>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#FFF7E6] p-5">
              <p className={cn('text-base font-semibold text-[#24252C]', HEADING_FONT)}>Isi preferensi belajarmu agar rekomendasi lebih pas</p>
              <p className="mt-1 text-sm text-[#6E6A7C]">Sementara ini kami tampilkan kelas populer yang belum kamu ambil.</p>
              <Button className="mt-4 px-5 py-3 text-sm" onClick={() => navigate('/kenali-gaya-belajar')}>
                Isi Sekarang
              </Button>
            </div>
          )}
          <div className="mt-6 space-y-4">
            {rek.data.length === 0 ? (
              <EmptyState title="Belum ada kelas yang cocok" desc="Kamu sudah mengambil semua kelas yang tersedia, atau belum ada kelas terbit." />
            ) : (
              rek.data.map((k) => <CourseCard key={k.id} kelas={k} />)
            )}
          </div>
        </>
      )}
    </Screen>
  )
}
