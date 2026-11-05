import { HiBell } from 'react-icons/hi'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'

export function NotificationBell() {
  const { navigate } = useRouter()
  const { db } = useDb()
  const ada = db.notifikasi.some((n) => n.idPengguna === db.sesi?.idPengguna && !n.sudahDibaca)
  return (
    <button type="button" aria-label="Notifikasi" onClick={() => navigate('/notifikasi')} className="relative flex size-10 items-center justify-center text-[#24252C]">
      <HiBell className="size-6" />
      {ada && <span className="absolute top-1.5 right-2 size-2.5 rounded-full bg-[#5F33E1] ring-2 ring-white" />}
    </button>
  )
}
