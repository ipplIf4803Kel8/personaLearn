import { MdSchool } from 'react-icons/md'
import { useParams } from 'react-router'
import { SuccessScreen } from '@/components/pelajar/DataState'
import { useRouter } from '@/lib/router'

// UC2-L05 Ambil Kelas Berhasil
export function AmbilKelasBerhasilPage() {
  const params = useParams()
  const { navigate } = useRouter()
  return (
    <SuccessScreen
      kode="UC2-L05"
      icon={MdSchool}
      title="Kelas berhasil diambil!"
      desc="Kelas sudah masuk ke Daftar Kelas Anda. Yuk mulai belajar sekarang."
      action="Mulai Belajar"
      onAction={() => navigate(`/belajar/${params.id}`, { replace: true })}
      secondary="Nanti saja"
      onSecondary={() => navigate('/beranda', { replace: true })}
    />
  )
}
