import { useState } from 'react'
import { HiOutlineEyeSlash, HiOutlineLockClosed } from 'react-icons/hi2'
import { MdChevronRight, MdMoreVert, MdOutlineEdit, MdOutlineMailOutline, MdOutlinePhone } from 'react-icons/md'
import { Avatar } from '@/components/pelajar/Avatar'
import { IconField } from '@/components/pelajar/FormField'
import { Screen } from '@/components/pelajar/Screen'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { ErrorState, SuccessBanner } from '@/components/pelajar/DataState'
import { Button } from '@/components/pelajar/Button'
import { NotificationBell } from '@/components/pelajar/NotificationBell'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { clearAsyncCache } from '@/hooks/useAsync'
import { useProfil } from '@/lib/useProfil'
import { useRouter } from '@/lib/router'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const TAUTAN = [
  ['Ubah Profil', '/profil/ubah'],
  ['Ubah Kata Sandi', '/profil/kata-sandi'],
  ['Pengaturan Notifikasi', '/notifikasi/pengaturan'],
]

export function MoreMenu() {
  const { navigate } = useRouter()
  const [buka, setBuka] = useState(false)
  return (
    <div className="relative">
      <button type="button" aria-label="Menu lainnya" aria-expanded={buka} onClick={() => setBuka((v) => !v)} className="flex size-10 items-center justify-center text-[#24252C]">
        <MdMoreVert className="size-7" />
      </button>
      {buka && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setBuka(false)} />
          <ul className="absolute top-11 right-0 z-50 w-56 overflow-hidden rounded-2xl bg-white py-2 shadow-xl ring-1 ring-black/5">
            {TAUTAN.map(([l, to]) => (
              <li key={to}>
                <button type="button" onClick={() => navigate(to)} className="w-full px-5 py-3 text-left text-sm hover:bg-[#F5F1FF]">
                  {l}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function ProfilSkeleton() {
  return (
    <div className="flex animate-pulse flex-col items-center px-6 pt-4" aria-busy="true" aria-label="Memuat profil">
      <div className="size-36 rounded-full bg-[#ECE8F8]" />
      <div className="mt-4 h-6 w-40 rounded bg-[#ECE8F8]" />
      <div className="mt-2 h-4 w-24 rounded bg-[#F3F0FB]" />
      <div className="mt-10 w-full space-y-4">
        {[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-xl bg-[#F3F0FB]" />)}
      </div>
    </div>
  )
}

function BarisTautan({ to, children }) {
  const { navigate } = useRouter()
  return (
    <button type="button" onClick={() => navigate(to)} className="flex w-full items-center justify-between rounded-xl bg-[#F7F5FF] px-5 py-4 text-left text-sm font-medium text-[#24252C]">
      {children}
      <MdChevronRight className="size-6 text-subtle" />
    </button>
  )
}

/** Tampilan dasar Profil (UC4-L01); layar lain UC4 tampil sebagai panel di atasnya, sesuai Figma. */
export function ProfileLayout({ kode, pesan, children }) {
  const { navigate } = useRouter()
  const profil = useProfil()
  const u = profil.data
  const [keluar, setKeluar] = useState(false)
  const { logout } = useAuth()
  return (
    <Screen
      kode={kode}
      back="/beranda"
      title="Profil"
      nav={!children}
      className="px-0"
      actions={
        <>
          <NotificationBell />
          <MoreMenu />
        </>
      }
    >
      {pesan && (
        <div className="px-6">
          <SuccessBanner>{pesan}</SuccessBanner>
        </div>
      )}
      {profil.memuat ? (
        <ProfilSkeleton />
      ) : profil.gagal ? (
        <ErrorState title="Profil gagal dimuat" onRetry={profil.ulangi} />
      ) : (
        <>
          <div className={cn('flex flex-col items-center px-6 text-center', pesan ? 'pt-2' : 'pt-4')}>
            <div className="relative">
              <Avatar u={{ nama: u.name, foto: u.avatarUrl }} className="size-36 text-5xl shadow-[0_12px_30px_rgba(95,51,225,0.18)]" />
              <button
                type="button"
                aria-label="Ubah foto profil"
                onClick={() => navigate('/profil/ubah')}
                className="absolute right-2 bottom-2 flex size-11 items-center justify-center rounded-full bg-[#5F33E1] text-white ring-4 ring-white"
              >
                <MdOutlineEdit className="size-6" />
              </button>
            </div>
            <h1 className={cn('mt-4 text-xl font-semibold text-[#24252C]', HEADING_FONT)}>{u.name}</h1>
            <p className="text-base text-subtle">Pelajar Aktif</p>
          </div>

          <section className="mt-8 rounded-t-[2rem] bg-white px-6 pt-4 pb-6 shadow-[0_-8px_24px_rgba(36,37,44,0.05)]">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-[#CBB9FF]" />
            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <p className={cn('text-base font-semibold', HEADING_FONT)}>Email</p>
                <IconField icon={MdOutlineMailOutline}>{u.email}</IconField>
              </div>
              <div className="space-y-2">
                <p className={cn('text-base font-semibold', HEADING_FONT)}>Nomor Telepon</p>
                <IconField icon={MdOutlinePhone}>{u.phone || 'Belum diisi'}</IconField>
              </div>
              <div className="space-y-2">
                <p className={cn('text-base font-semibold', HEADING_FONT)}>Kata Sandi</p>
                <IconField
                  icon={HiOutlineLockClosed}
                  role="button"
                  tabIndex={0}
                  aria-label="Ubah kata sandi"
                  onClick={() => navigate('/profil/kata-sandi')}
                  className="cursor-pointer hover:border-[#5F33E1]"
                  kanan={<HiOutlineEyeSlash className="size-6 text-subtle" />}
                >
                  ••••••••
                </IconField>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <BarisTautan to="/kenali-gaya-belajar">Preferensi Belajar</BarisTautan>
              <BarisTautan to="/notifikasi/pengaturan">Pengaturan Notifikasi</BarisTautan>
            </div>
            <Button variant="outline" className="mt-8 w-full" onClick={() => setKeluar(true)}>
              Keluar
            </Button>
          </section>
        </>
      )}

      {children}

      <BottomSheet open={keluar} onClose={() => setKeluar(false)} center kode="UC4-L06">
        <div className="text-center">
          <h2 className={cn('text-lg font-semibold text-[#24252C]', HEADING_FONT)}>Yakin ingin keluar?</h2>
          <p className="mt-2 text-sm text-[#6E6A7C]">Anda perlu masuk lagi untuk melanjutkan belajar.</p>
          <Button
            className="mt-6 w-full"
            onClick={() => {
              logout()
              clearAsyncCache()
              navigate('/masuk', { replace: true })
            }}
          >
            Keluar
          </Button>
          <Button variant="outline" className="mt-3 w-full" onClick={() => setKeluar(false)}>
            Batal
          </Button>
        </div>
      </BottomSheet>
    </Screen>
  )
}
