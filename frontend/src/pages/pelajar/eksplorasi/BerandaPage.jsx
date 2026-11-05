import personImg from '@/assets/onboarding/person.png'
import { CourseCard } from '@/components/pelajar/CourseCard'
import { SearchBar } from '@/components/pelajar/SearchBar'
import { SectionTitle, Screen } from '@/components/pelajar/Screen'
import { Loading, ErrorState } from '@/components/pelajar/DataState'
import { TextLink, Button } from '@/components/pelajar/Button'
import { NotificationBell } from '@/components/pelajar/NotificationBell'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { penggunaAktif, useDb } from '@/data/db'
import { useAsync } from '@/hooks/useAsync'
import { kelasPopuler } from '@/data/courseApi'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC2-L01 Beranda
export function BerandaPage() {
  const { navigate } = useRouter()
  const { db } = useDb()
  const u = penggunaAktif(db)
  const populer = useAsync(() => kelasPopuler(), []) // data dari backend
  const jumlahTerbit = db.kelas.filter((k) => k.status === 'terbit').length
  return (
    <Screen kode="UC2-L01" nav>
      <div className="flex items-start justify-between pt-8">
        <div>
          <h1 className={cn('text-2xl font-semibold text-[#24252C]', HEADING_FONT)}>Hai, {u?.nama.split(' ')[0]}</h1>
          <p className="mt-1 text-base text-[#6E6A7C]">Temukan pelajaranmu hari ini!</p>
        </div>
        <NotificationBell />
      </div>

      <div className="mt-6">
        <SearchBar onClick={() => navigate('/cari')} onFilter={() => navigate('/cari?filter=1')} />
      </div>

      <section data-testid="card-rekomendasi" className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#EEE9FF] to-[#E2D9FF] p-6">
        <p className="text-base font-medium text-[#5F33E1]">Rekomendasi Untukmu</p>
        <p className={cn('mt-1 text-[#24252C]', HEADING_FONT)}>
          <span className="text-3xl font-bold">+{jumlahTerbit}</span> <span className="text-base text-[#5F33E1]">Pelajaran</span>
        </p>
        <Button className="mt-4 px-5 py-3 text-base" onClick={() => navigate('/rekomendasi')}>
          Lanjut Jelajahi
        </Button>
        <img src={personImg} alt="" className="pointer-events-none absolute -right-4 -bottom-2 h-[150px] object-contain" />
      </section>

      <SectionTitle action={<TextLink onClick={() => navigate('/populer')}>Lihat Lengkap</TextLink>}>Pelajaran Populer!</SectionTitle>
      {populer.memuat ? (
        <Loading />
      ) : populer.gagal ? (
        <ErrorState title="Pelajaran Populer gagal dimuat" onRetry={populer.ulangi} />
      ) : (
        <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-4">
          {populer.data.slice(0, 6).map((k) => (
            <CourseCard key={k.id} kelas={k} layout="grid" />
          ))}
        </div>
      )}
    </Screen>
  )
}
