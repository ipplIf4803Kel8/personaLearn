import { useRouter } from '@/lib/router'

/** Halaman 404: alamat tidak dikenal. */
export function NotFoundPage() {
  const { navigate } = useRouter()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-bold text-[#5F33E1]">404</p>
      <p className="text-gray-600">Halaman tidak ditemukan.</p>
      <button type="button" className="font-semibold text-[#5F33E1] underline" onClick={() => navigate('/', { replace: true })}>
        Kembali ke awal
      </button>
    </div>
  )
}
