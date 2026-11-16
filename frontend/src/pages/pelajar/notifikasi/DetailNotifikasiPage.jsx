import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Screen } from '@/components/pelajar/Screen'
import { EmptyState, ErrorState, Loading } from '@/components/pelajar/DataState'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { api } from '@/lib/api'
import { jenisNotifikasi, kabarkanNotifikasiBerubah } from '@/lib/notifikasi'
import { cn } from '@/lib/utils'

// UC5-L04 Detail Notifikasi; membuka detail menandai notifikasi sudah dibaca
export function DetailNotifikasiPage() {
  const { id } = useParams()
  const [state, setState] = useState({ status: 'memuat', n: null })

  const muat = useCallback(() => {
    setState({ status: 'memuat', n: null })
    api(`/notifications/${id}`)
      .then(async (res) => {
        setState({ status: 'ok', n: res.data })
        if (!res.data.isRead) {
          await api(`/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {})
          kabarkanNotifikasiBerubah()
        }
      })
      .catch((err) => setState({ status: /tidak ditemukan/i.test(err.message) ? 'kosong' : 'gagal', n: null }))
  }, [id])
  useEffect(muat, [muat])

  const { status, n } = state
  return (
    <Screen kode="UC5-L04" back="/notifikasi" title="Detail Notifikasi">
      {status === 'memuat' && <Loading />}
      {status === 'gagal' && <ErrorState title="Notifikasi gagal dimuat" onRetry={muat} />}
      {status === 'kosong' && <EmptyState title="Notifikasi tidak ditemukan" />}
      {status === 'ok' && (
        <>
          <span className="rounded-full bg-[#EEE9FF] px-3 py-1 text-xs font-medium text-[#5F33E1]">{jenisNotifikasi(n.type).label}</span>
          <h1 className={cn('mt-4 text-xl font-semibold text-[#24252C]', HEADING_FONT)}>{n.title}</h1>
          <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          <p className="mt-5 text-base leading-relaxed whitespace-pre-line text-[#6E6A7C]">{n.body}</p>
        </>
      )}
    </Screen>
  )
}
