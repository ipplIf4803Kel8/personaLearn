import { useState } from 'react'
import { TbRobot } from 'react-icons/tb'
import { useParams } from 'react-router'
import { Screen } from '@/components/pelajar/Screen'
import { Chat, BotHeader } from '@/components/pelajar/Chat'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC6-L03 Obrolan Sinau Bot (+ UC6-L04 Tawaran One-to-One)
export function ObrolanSinauBotPage() {
  const { id } = useParams()
  const { navigate, query } = useRouter()
  const { user } = useAuth()
  const [tawaran, setTawaran] = useState(false)

  return (
    <Screen kode="UC6-L03" back title="Detil Obrolan" bell className="pb-28">
      <BotHeader />
      <button type="button" onClick={() => setTawaran(true)} className="mt-3 text-sm font-medium text-[#5F33E1]">
        Butuh bantuan lebih?
      </button>
      <div className="mt-4">
        <Chat lessonId={id} nama={user?.name} pesanAwal={query.q} />
      </div>

      <BottomSheet open={tawaran} onClose={() => setTawaran(false)} center kode="UC6-L04">
        <div className="text-center">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#EEE9FF] text-[#5F33E1]">
            <TbRobot className="size-11" />
          </span>
          <h2 className={cn('mt-4 text-xl font-semibold text-[#5F33E1]', HEADING_FONT)}>Butuh bantuan lebih?</h2>
          <p className="mt-3 text-base text-[#24252C]">Mau belajar One-to-One dengan AI untuk materi ini?</p>
          <Button className="mt-6 w-full py-3.5" onClick={() => navigate(`/one-to-one/${id}`)}>
            Ya, Bantu Saya
          </Button>
          <Button variant="outline" className="mt-3 w-full py-3.5 font-normal" onClick={() => setTawaran(false)}>
            Nanti Saja
          </Button>
        </div>
      </BottomSheet>
    </Screen>
  )
}
