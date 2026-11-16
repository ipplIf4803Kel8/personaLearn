import { useEffect, useState } from 'react'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { Button } from '@/components/pelajar/Button'
import { api } from '@/lib/api'
import { formatDurasi, youtubeEmbed } from '@/lib/learning'
import { isHttpUrl } from '@/lib/validators'

/** Bottom sheet pratinjau pelajaran pertama (GET /courses/:id/preview). */
export function PratinjauSheet({ open, onClose, idKelas, onAmbil, loading, sudahIkut }) {
  const [state, setState] = useState({ memuat: true, galat: '', data: null })

  useEffect(() => {
    if (!open) return undefined
    let batal = false
    setState({ memuat: true, galat: '', data: null })
    api(`/courses/${idKelas}/preview`)
      .then((r) => !batal && setState({ memuat: false, galat: '', data: r.data }))
      .catch((e) => !batal && setState({ memuat: false, galat: e.message || 'Pratinjau gagal dimuat', data: null }))
    return () => {
      batal = true
    }
  }, [open, idKelas])

  const { memuat, galat, data } = state
  const url = data && isHttpUrl(data.videoUrl) ? data.videoUrl : null
  const embed = youtubeEmbed(url)

  return (
    <BottomSheet open={open} onClose={onClose} title={data?.title ?? 'Pratinjau'}>
      {memuat ? (
        <p className="py-8 text-center text-sm text-[#6E6A7C]">Memuat...</p>
      ) : galat ? (
        <p className="py-8 text-center text-sm text-[#6E6A7C]">{galat}</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-black">
            {embed ? (
              <iframe title={data.title} src={embed} className="aspect-[16/9] w-full" allow="encrypted-media; picture-in-picture" allowFullScreen />
            ) : url ? (
              <video src={url} controls playsInline className="aspect-[16/9] w-full" />
            ) : (
              <p className="flex aspect-[16/9] items-center justify-center bg-[#F5F1FF] px-4 text-center text-xs text-[#5F33E1]">Video pratinjau belum tersedia.</p>
            )}
          </div>
          {data.durationSeconds > 0 && <p className="mt-3 text-sm text-subtle">{formatDurasi(data.durationSeconds)}</p>}
          {data.description && <p className="mt-4 text-sm leading-relaxed text-[#6E6A7C]">{data.description}</p>}
          {!sudahIkut && (
            <Button className="mt-5 w-full" loading={loading} onClick={onAmbil}>
              Ambil Kelas
            </Button>
          )}
        </>
      )}
    </BottomSheet>
  )
}
