import { useParams } from 'react-router'
import { LoginScreen } from '@/components/auth/auth-screen'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC1-L11 Otorisasi Akun (Google / Facebook / Apple). Belum tersedia, jadi dialog hanya memberi tahu "Segera hadir".
export const PENYEDIA = ['Google', 'Facebook', 'Apple']

export function OtorisasiPage() {
  const params = useParams()
  const { navigate } = useRouter()
  const nama = PENYEDIA.includes(params.penyedia) ? params.penyedia : 'Google'
  return (
    <div data-screen="UC1-L11" className="relative">
      <div aria-hidden="true" className="pointer-events-none">
        <LoginScreen onSubmit={() => {}} />
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24252C]/45 p-6 font-['DM_Sans',ui-sans-serif]">
        <div role="dialog" aria-modal="true" aria-labelledby="judul-otorisasi" className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
          <h1 id="judul-otorisasi" className={cn('text-xl font-semibold text-[#24252C]', HEADING_FONT)}>
            Masuk dengan {nama}
          </h1>
          <p className="mt-3 text-base text-[#6E6A7C]">Segera hadir. Untuk sekarang, masuk dengan email dan kata sandi.</p>
          <Button className="mt-5 w-full py-3.5" onClick={() => navigate('/masuk', { replace: true })}>
            Kembali ke Masuk
          </Button>
        </div>
      </div>
    </div>
  )
}
