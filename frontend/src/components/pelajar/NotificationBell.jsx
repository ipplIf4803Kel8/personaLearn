import { useEffect, useState } from 'react'
import { HiBell } from 'react-icons/hi'
import { api, getToken } from '@/lib/api'
import { NOTIFIKASI_BERUBAH } from '@/lib/notifikasi'
import { useRouter } from '@/lib/router'

// Titik ungu muncul bila ada notifikasi yang belum dibaca
export function NotificationBell() {
  const { navigate } = useRouter()
  const [ada, setAda] = useState(false)
  useEffect(() => {
    if (!getToken()) return undefined
    let batal = false
    const muat = () =>
      api('/notifications?limit=1')
        .then((res) => !batal && setAda(res.data.unread > 0))
        .catch(() => {})
    muat()
    window.addEventListener(NOTIFIKASI_BERUBAH, muat)
    return () => {
      batal = true
      window.removeEventListener(NOTIFIKASI_BERUBAH, muat)
    }
  }, [])
  return (
    <button type="button" aria-label={ada ? 'Notifikasi, ada yang belum dibaca' : 'Notifikasi'} onClick={() => navigate('/notifikasi')} className="relative flex size-10 items-center justify-center text-[#24252C]">
      <HiBell className="size-6" />
      {ada && <span className="absolute top-1.5 right-2 size-2.5 rounded-full bg-[#5F33E1] ring-2 ring-white" />}
    </button>
  )
}
