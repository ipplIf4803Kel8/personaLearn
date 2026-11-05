import { HiMegaphone, HiOutlineChatBubbleLeftEllipsis, HiReceiptPercent, HiSparkles, HiTrophy } from 'react-icons/hi2'
import { MdMoreVert } from 'react-icons/md'
import { Screen } from '@/components/pelajar/Screen'
import { Loading, ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { useDb } from '@/data/db'
import { useAsync } from '@/hooks/useAsync'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

export function waktuRelatif(iso) {
  const hari = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5)
  if (hari <= 0) return 'Hari ini'
  if (hari === 1) return 'Kemarin'
  return `${hari} hari lalu`
}

export const IKON_JENIS = {
  'Pengingat belajar': { icon: HiMegaphone, warna: 'text-[#F0384B]' },
  'Tantangan mingguan': { icon: HiTrophy, warna: 'text-[#F59E0B]' },
  'Rekomendasi AI': { icon: HiSparkles, warna: 'text-[#5F33E1]' },
  'Promo & diskon': { icon: HiReceiptPercent, warna: 'text-[#F0384B]' },
}

export function waktuSingkat(iso) {
  const menit = Math.floor((Date.now() - new Date(iso).getTime()) / 6e4)
  if (menit < 60) return `${Math.max(1, menit)} Menit lalu`
  if (menit < 1440) return `${Math.floor(menit / 60)} Jam lalu`
  return waktuRelatif(iso)
}

// UC5-L01 Notifikasi (kondisi B: belum ada, C: gagal memuat)
export function NotifikasiPage() {
  const { navigate } = useRouter()
  const { db, aksi } = useDb()
  const muat = useAsync(() => aksi.muatNotifikasi(), [])
  const id = db.sesi?.idPengguna
  const daftar = db.notifikasi.filter((n) => n.idPengguna === id).sort((a, b) => b.waktu.localeCompare(a.waktu))
  return (
    <Screen
      kode="UC5-L01"
      back
      title="Notifikasi"
      blobs={false}
      actions={
        <button type="button" aria-label="Pengaturan Notifikasi" onClick={() => navigate('/notifikasi/pengaturan')} className="flex size-10 items-center justify-center text-[#24252C]">
          <MdMoreVert className="size-7" />
        </button>
      }
    >
      {muat.memuat ? (
        <Loading />
      ) : muat.gagal ? (
        <ErrorState title="Notifikasi gagal dimuat" onRetry={muat.ulangi} />
      ) : daftar.length === 0 ? (
        <div className="flex min-h-[65vh] items-center justify-center">
          <EmptyState icon={HiOutlineChatBubbleLeftEllipsis} title="Belum Notifikasi" desc="Kami akan memberi tahu Anda jika ada hal baru untuk diinformasikan" />
        </div>
      ) : (
        <ul className="mt-2 space-y-2">
          {daftar.map((n) => {
            const { icon: Icon, warna } = IKON_JENIS[n.jenis] ?? IKON_JENIS['Pengingat belajar']
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    aksi.tandaiDibaca(n.id)
                    navigate(`/notifikasi/${n.id}`)
                  }}
                  className="flex w-full gap-4 rounded-2xl py-3 text-left hover:bg-[#F7F5FF]"
                >
                  <Icon className={cn('mt-0.5 size-9 shrink-0', warna)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cn('text-base text-[#24252C]', n.sudahDibaca ? 'font-medium' : 'font-bold')}>{n.judul}</p>
                      <span className="shrink-0 text-xs text-[#8A8A94]">{waktuSingkat(n.waktu)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-[#6E6A7C]">{n.pesan}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Screen>
  )
}
