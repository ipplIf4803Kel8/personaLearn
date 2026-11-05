import { SuccessScreen } from '@/components/pelajar/DataState'
import { useRouter } from '@/lib/router'

// UC1-L08 Atur Ulang Kata Sandi Berhasil
export function AturUlangBerhasilPage() {
  const { navigate } = useRouter()
  return (
    <SuccessScreen
      kode="UC1-L08"
      title="Kata sandi berhasil diubah!"
      desc="Gunakan kata sandi baru untuk masuk ke akun Anda."
      action="Masuk Sekarang"
      onAction={() => navigate('/masuk', { replace: true })}
    />
  )
}
