import { SuccessScreen } from '@/components/pelajar/DataState'
import { useRouter } from '@/lib/router'

// UC1-L04 Buat Akun Berhasil
export function DaftarBerhasilPage() {
  const { navigate } = useRouter()
  return (
    <SuccessScreen
      kode="UC1-L04"
      title="Akun berhasil dibuat!"
      desc="Silakan masuk dengan email dan kata sandi yang baru Anda buat."
      action="Masuk Sekarang"
      onAction={() => navigate('/masuk', { replace: true })}
    />
  )
}
