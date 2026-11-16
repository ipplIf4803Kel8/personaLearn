import { useParams } from 'react-router'
import { Screen } from '@/components/pelajar/Screen'
import { Chat, BotHeader } from '@/components/pelajar/Chat'
import { Button } from '@/components/pelajar/Button'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/lib/router'

const PESAN_AWAL = 'Tolong bantu saya memahami materi ini langkah demi langkah, mulai dari dasarnya.'

// UC6-L05 Sesi One-to-One: obrolan terpandu dengan Sinau Bot untuk satu pelajaran
export function SesiOneToOnePage() {
  const { id } = useParams()
  const { navigate } = useRouter()
  const { user } = useAuth()

  return (
    <Screen kode="UC6-L05" back title="One-to-One" bell className="pb-28">
      <BotHeader />
      <Button variant="outline" className="mt-3 w-full py-2.5 font-normal" onClick={() => navigate(`/video/${id}`, { replace: true })}>
        Selesai, kembali ke video
      </Button>
      <div className="mt-4">
        <Chat lessonId={id} nama={user?.name} pesanAwal={PESAN_AWAL} awalHanyaJikaKosong />
      </div>
    </Screen>
  )
}
