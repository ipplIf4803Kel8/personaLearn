import { SuccessScreen } from '@/components/pelajar/DataState'
import { useRouter } from '@/lib/router'

// UC5-L03 Pengaturan Notifikasi Berhasil
export function PengaturanNotifikasiBerhasilPage() {
  const { navigate } = useRouter()
  return (
    <SuccessScreen
      kode="UC5-L03"
      title="Perubahan Berhasil"
      desc="Pengaturan notifikasi Anda sudah disimpan."
      action="Kembali ke Notifikasi"
      onAction={() => navigate('/notifikasi', { replace: true })}
    />
  )
}
