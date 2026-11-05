import { useState } from 'react'
import { useParams } from 'react-router'
import { LoginScreen } from '@/components/auth/auth-screen'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'
import { getHomePath } from '@/routes/getHomePath'

// UC1-L11 Otorisasi Akun (Google / Facebook / Apple) — dialog di atas layar Masuk, sesuai Figma
export const PENYEDIA = ['Google', 'Facebook', 'Apple']

export function OtorisasiPage() {
  const params = useParams()
  const { navigate } = useRouter()
  const { aksi } = useDb()
  const [loading, setLoading] = useState(false)
  const nama = PENYEDIA.includes(params.penyedia) ? params.penyedia : 'Google'
  const email = `${nama.toLowerCase()}.pelajar@example.com`
  return (
    <div data-screen="UC1-L11" className="relative">
      <div aria-hidden="true" className="pointer-events-none">
        <LoginScreen onSubmit={() => {}} />
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24252C]/45 p-6 font-['DM_Sans',ui-sans-serif]">
        <div role="dialog" aria-modal="true" aria-labelledby="judul-otorisasi" className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
          <h1 id="judul-otorisasi" className={cn('text-xl font-semibold text-[#24252C]', HEADING_FONT)}>
            Masuk dengan Akun {nama}
          </h1>
          <p className="mt-3 text-base text-[#6E6A7C]">E-Learning ingin mengakses nama dan alamat email kamu.</p>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-[#5F33E1] bg-[#F5F1FF] p-4 text-left">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#5F33E1] text-lg font-semibold text-white">{nama[0]}</span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-medium text-[#24252C]">Pengguna {nama}</span>
              <span className="block truncate text-base text-[#6E6A7C]">{email}</span>
            </span>
          </div>
          <Button
            className="mt-5 w-full py-3.5"
            loading={loading}
            onClick={async () => {
              setLoading(true)
              const r = await aksi.masukOAuth(nama)
              navigate(getHomePath(r.pengguna), { replace: true })
            }}
          >
            Lanjutkan
          </Button>
          <Button variant="outline" className="mt-3 w-full py-3.5" onClick={() => navigate('/masuk', { replace: true })}>
            Batal
          </Button>
        </div>
      </div>
    </div>
  )
}
