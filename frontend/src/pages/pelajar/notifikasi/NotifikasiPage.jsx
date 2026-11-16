import { useCallback, useEffect, useState } from 'react'
import { HiOutlineChatBubbleLeftEllipsis } from 'react-icons/hi2'
import { MdMoreVert } from 'react-icons/md'
import { Screen } from '@/components/pelajar/Screen'
import { ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { Button } from '@/components/pelajar/Button'
import { useToast } from '@/components/pelajar/Toast'
import { api } from '@/lib/api'
import { jenisNotifikasi, kabarkanNotifikasiBerubah, waktuRelatif } from '@/lib/notifikasi'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

const PER_HALAMAN = 20

function Skeleton() {
  return (
    <ul className="mt-2 space-y-4" aria-busy="true" aria-label="Memuat notifikasi">
      {[0, 1, 2, 3, 4].map((i) => (
        <li key={i} className="flex animate-pulse gap-4 py-3">
          <div className="size-9 shrink-0 rounded-full bg-[#ECE8F8]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-[#ECE8F8]" />
            <div className="h-3 w-full rounded bg-[#F3F0FB]" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function Menu({ onTandaiSemua, onPengaturan, adaBelumDibaca }) {
  const [buka, setBuka] = useState(false)
  return (
    <div className="relative">
      <button type="button" aria-label="Menu notifikasi" aria-expanded={buka} onClick={() => setBuka((v) => !v)} className="flex size-10 items-center justify-center text-[#24252C]">
        <MdMoreVert className="size-7" />
      </button>
      {buka && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setBuka(false)} />
          <ul className="absolute top-11 right-0 z-50 w-60 overflow-hidden rounded-2xl bg-white py-2 shadow-xl ring-1 ring-black/5">
            <li>
              <button type="button" disabled={!adaBelumDibaca} onClick={() => { setBuka(false); onTandaiSemua() }} className="w-full px-5 py-3 text-left text-sm hover:bg-[#F5F1FF] disabled:text-subtle disabled:hover:bg-transparent">
                Tandai semua dibaca
              </button>
            </li>
            <li>
              <button type="button" onClick={onPengaturan} className="w-full px-5 py-3 text-left text-sm hover:bg-[#F5F1FF]">
                Pengaturan Notifikasi
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  )
}

// UC5-L01 Notifikasi (kondisi B: belum ada, C: gagal memuat)
export function NotifikasiPage() {
  const { navigate } = useRouter()
  const toast = useToast()
  const [status, setStatus] = useState('memuat')
  const [daftar, setDaftar] = useState([])
  const [info, setInfo] = useState({ page: 0, total: 0, unread: 0 })
  const [memuatLagi, setMemuatLagi] = useState(false)

  const muat = useCallback(async (page) => {
    const res = await api(`/notifications?page=${page}&limit=${PER_HALAMAN}`)
    const { items, ...rest } = res.data
    setDaftar((lama) => (page === 1 ? items : [...lama, ...items]))
    setInfo(rest)
  }, [])

  const muatAwal = useCallback(() => {
    setStatus('memuat')
    muat(1).then(() => setStatus('ok')).catch(() => setStatus('gagal'))
  }, [muat])
  useEffect(muatAwal, [muatAwal])

  async function muatBerikutnya() {
    setMemuatLagi(true)
    try {
      await muat(info.page + 1)
    } catch {
      toast('Notifikasi gagal dimuat. Coba lagi.', 'gagal')
    } finally {
      setMemuatLagi(false)
    }
  }

  async function tandaiSemua() {
    try {
      await api('/notifications/read-all', { method: 'PATCH' })
      setDaftar((d) => d.map((n) => ({ ...n, isRead: true })))
      setInfo((i) => ({ ...i, unread: 0 }))
      kabarkanNotifikasiBerubah()
    } catch {
      toast('Gagal menandai notifikasi. Coba lagi.', 'gagal')
    }
  }

  return (
    <Screen
      kode="UC5-L01"
      back
      title="Notifikasi"
      blobs={false}
      actions={<Menu adaBelumDibaca={info.unread > 0} onTandaiSemua={tandaiSemua} onPengaturan={() => navigate('/notifikasi/pengaturan')} />}
    >
      {status === 'memuat' ? (
        <Skeleton />
      ) : status === 'gagal' ? (
        <ErrorState title="Notifikasi gagal dimuat" onRetry={muatAwal} />
      ) : daftar.length === 0 ? (
        <div className="flex min-h-[65vh] items-center justify-center">
          <EmptyState icon={HiOutlineChatBubbleLeftEllipsis} title="Belum Notifikasi" desc="Kami akan memberi tahu Anda jika ada hal baru untuk diinformasikan" />
        </div>
      ) : (
        <>
          <ul className="mt-2 space-y-2">
            {daftar.map((n) => {
              const { icon: Icon, warna } = jenisNotifikasi(n.type)
              return (
                <li key={n.id}>
                  <button type="button" onClick={() => navigate(`/notifikasi/${n.id}`)} className="flex w-full gap-4 rounded-2xl py-3 text-left hover:bg-[#F7F5FF]">
                    <Icon className={cn('mt-0.5 size-9 shrink-0', warna)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={cn('truncate text-base text-[#24252C]', n.isRead ? 'font-medium' : 'font-bold')}>{n.title}</p>
                        <span className="shrink-0 text-xs text-subtle">{waktuRelatif(n.createdAt)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-[#6E6A7C]">{n.body}</p>
                    </div>
                    {!n.isRead && <span aria-label="Belum dibaca" className="mt-2 size-2.5 shrink-0 rounded-full bg-[#5F33E1]" />}
                  </button>
                </li>
              )
            })}
          </ul>
          {daftar.length < info.total && (
            <Button variant="outline" className="mt-4 w-full" loading={memuatLagi} onClick={muatBerikutnya}>
              Muat lebih banyak
            </Button>
          )}
        </>
      )}
    </Screen>
  )
}
