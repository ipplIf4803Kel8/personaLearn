import { MdArrowForward } from 'react-icons/md'
import { useParams } from 'react-router'
import { Screen } from '@/components/pelajar/Screen'
import { EmptyState } from '@/components/pelajar/DataState'
import { Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC5-L04 Detail Notifikasi
export function DetailNotifikasiPage() {
  const params = useParams()
  const { navigate } = useRouter()
  const { db } = useDb()
  const n = db.notifikasi.find((x) => x.id === Number(params.id))
  if (!n) return <Screen back title="Detail Notifikasi"><EmptyState title="Notifikasi tidak ditemukan" /></Screen>
  return (
    <Screen kode="UC5-L04" back="/notifikasi" title="Detail Notifikasi">
      <span className="rounded-full bg-[#EEE9FF] px-3 py-1 text-xs font-medium text-[#5F33E1]">{n.jenis}</span>
      <h1 className={cn('mt-4 text-xl font-semibold text-[#24252C]', HEADING_FONT)}>{n.judul}</h1>
      <p className="mt-1 text-xs text-slate-400">{new Date(n.waktu).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      <p className="mt-5 text-base leading-relaxed text-[#6E6A7C]">{n.pesan}</p>
      {n.tautan && (
        <Button className="mt-8 w-full" onClick={() => navigate(n.tautan)}>
          Buka Halaman Terkait <MdArrowForward />
        </Button>
      )}
    </Screen>
  )
}
