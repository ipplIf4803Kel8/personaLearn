import { CourseCard } from '@/components/pelajar/CourseCard'
import { Screen } from '@/components/pelajar/Screen'
import { EmptyState, ErrorState, Loading } from '@/components/pelajar/DataState'
import { Button } from '@/components/pelajar/Button'
import { cariKelas } from '@/data/courseApi'
import { useAsync } from '@/hooks/useAsync'
import { useRouter } from '@/lib/router'

// UC2-L07 Kelas Favorit (kondisi B: belum ada favorit). Data dari backend (GET /courses?favoritesOnly=true).
export function KelasFavoritPage() {
  const { navigate } = useRouter()
  const daftar = useAsync(() => cariKelas({ favoritSaja: true }), [])
  return (
    <Screen kode="UC2-L07" back title="Kelas Favorit" nav>
      {daftar.memuat ? (
        <Loading />
      ) : daftar.gagal ? (
        <ErrorState title="Kelas favorit gagal dimuat" onRetry={daftar.ulangi} />
      ) : daftar.data.length === 0 ? (
        <EmptyState
          title="Belum ada kelas favorit"
          desc="Tekan ikon hati pada kelas untuk menyimpannya di sini."
          action={<Button className="py-3" onClick={() => navigate('/cari')}>Jelajahi Kelas</Button>}
        />
      ) : (
        <div className="mt-2 space-y-4">
          {daftar.data.map((k) => (
            // Setelah hati ditekan, daftar dimuat ulang supaya kelas yang dihapus hilang.
            <CourseCard key={k.id} kelas={k} onUbahFavorit={daftar.ulangi} />
          ))}
        </div>
      )}
    </Screen>
  )
}
