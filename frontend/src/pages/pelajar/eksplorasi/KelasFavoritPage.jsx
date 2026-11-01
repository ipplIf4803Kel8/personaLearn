import { useMemo } from 'react'
import { CourseCard } from '@/components/pelajar/CourseCard'
import { Screen } from '@/components/pelajar/Screen'
import { EmptyState } from '@/components/pelajar/DataState'
import { Button } from '@/components/pelajar/Button'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'

// UC2-L07 Kelas Favorit (kondisi B: belum ada favorit)
export function KelasFavoritPage() {
  const { navigate } = useRouter()
  const { db } = useDb()
  const id = db.sesi?.idPengguna
  const daftar = useMemo(
    () => db.favorit.filter((f) => f.idPengguna === id).map((f) => db.kelas.find((k) => k.id === f.idKelas)).filter((k) => k && k.status === 'terbit'),
    [db, id],
  )
  return (
    <Screen kode="UC2-L07" back title="Kelas Favorit" nav>
      {daftar.length === 0 ? (
        <EmptyState
          title="Belum ada kelas favorit"
          desc="Tekan ikon hati pada kelas untuk menyimpannya di sini."
          action={<Button className="py-3" onClick={() => navigate('/cari')}>Jelajahi Kelas</Button>}
        />
      ) : (
        <div className="mt-2 space-y-4">
          {daftar.map((k) => (
            <CourseCard key={k.id} kelas={k} />
          ))}
        </div>
      )}
    </Screen>
  )
}
