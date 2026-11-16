import personImg from '@/assets/onboarding/person.png'
import { CourseCard } from '@/components/pelajar/CourseCard'
import { SearchBar } from '@/components/pelajar/SearchBar'
import { SectionTitle, Screen } from '@/components/pelajar/Screen'
import { Loading, ErrorState } from '@/components/pelajar/DataState'
import { TextLink, Button } from '@/components/pelajar/Button'
import { NotificationBell } from '@/components/pelajar/NotificationBell'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { useAuth } from '@/context/AuthContext'
import { useAsync } from '@/hooks/useAsync'
import { kelasPopuler, kelasRekomendasi } from '@/data/courseApi'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC2-L01 Beranda
export function BerandaPage() {
  const { navigate } = useRouter()
  const { user } = useAuth()
  const populer = useAsync(() => kelasPopuler(), []) // data dari backend
  const rekomendasi = useAsync(() => kelasRekomendasi(), []) // hasil engine rekomendasi
  return (
    <Screen kode="UC2-L01" nav>
      <div className="flex items-start justify-between pt-8">
        <div>
          <h1 className={cn('text-2xl font-semibold text-[#24252C]', HEADING_FONT)}>Hai, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-base text-[#6E6A7C]">Temukan pelajaranmu hari ini!</p>
        </div>
        <NotificationBell />
      </div>

      <div className="mt-6">
        <SearchBar onClick={() => navigate('/cari')} onFilter={() => navigate('/cari?filter=1')} />
      </div>

      <section data-testid="card-rekomendasi" className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#EEE9FF] to-[#E2D9FF] p-6">
        <p className="text-base font-medium text-[#5F33E1]">Pilihan Terbaik</p>
        <p className={cn('mt-1 text-[#24252C]', HEADING_FONT)}>
          <span className="text-3xl font-bold">+{(rekomendasi.data ?? []).reduce((n, k) => n + k.jumlahPelajaran, 0)}</span> <span className="text-base text-[#5F33E1]">Pelajaran</span>
        </p>
        <Button className="mt-4 px-5 py-3 text-base" onClick={() => navigate('/rekomendasi')}>
          Lanjut Jelajahi
        </Button>
        <img src={personImg} alt="" className="pointer-events-none absolute -right-4 -bottom-2 h-[150px] object-contain" />
      </section>

      <SectionTitle action={<TextLink onClick={() => navigate('/rekomendasi')}>Lihat Lengkap</TextLink>}>Rekomendasi Untukmu</SectionTitle>
      <CourseRow state={rekomendasi} judul="Rekomendasi gagal dimuat" kosong="Belum ada kelas yang bisa direkomendasikan." />

      <SectionTitle action={<TextLink onClick={() => navigate('/populer')}>Lihat Lengkap</TextLink>}>Pelajaran Populer!</SectionTitle>
      <CourseRow state={populer} judul="Pelajaran Populer gagal dimuat" kosong="Belum ada kelas terbit." />
    </Screen>
  )
}

// Baris kartu geser horizontal dengan state memuat, gagal, dan kosong.
function CourseRow({ state, judul, kosong }) {
  if (state.memuat) return <Loading />
  if (state.gagal) return <ErrorState title={judul} onRetry={state.ulangi} />
  if (state.data.length === 0) return <p className="py-6 text-center text-sm text-[#6E6A7C]">{kosong}</p>
  return (
    <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-4">
      {state.data.slice(0, 6).map((k) => (
        <CourseCard key={k.id} kelas={k} layout="grid" />
      ))}
    </div>
  )
}
