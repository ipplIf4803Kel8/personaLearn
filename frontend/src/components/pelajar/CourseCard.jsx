import { MdFavorite, MdFavoriteBorder, MdStar } from 'react-icons/md'
import { TbClockHour4 } from 'react-icons/tb'
import { useToast } from '@/components/pelajar/Toast'
import { formatDuration } from '@/components/pelajar/theme'
import { durasiKelas, kategoriDari, pelajaranKelas, useDb } from '@/data/db'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

/** Sampul kelas: gambar dari admin, atau latar lavender + ikon kategori (pengganti ilustrasi Figma). */
export function CourseThumbnail({ kelas, className }) {
  const { db } = useDb()
  const kat = kategoriDari(db, kelas.idKategori)
  if (kelas.gambar) return <img src={kelas.gambar} alt="" className={cn('object-cover', className)} />
  return (
    <div className={cn('flex items-center justify-center bg-[#E8E0FF] text-3xl', className)}>
      <span aria-hidden="true">{kat?.ikon ?? '📘'}</span>
    </div>
  )
}

export function Rating({ value, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm text-[#8A8A94]', className)}>
      <MdStar className="size-5 text-[#FFC71E]" />
      {Number(value).toFixed(1)}
    </span>
  )
}

export function FavoriteButton({ idKelas, className, terang }) {
  const { db, aksi } = useDb()
  const toast = useToast()
  const id = db.sesi?.idPengguna
  const aktif = db.favorit.some((f) => f.idPengguna === id && f.idKelas === idKelas)
  return (
    <button
      type="button"
      aria-label={aktif ? 'Hapus dari favorit' : 'Simpan ke favorit'}
      aria-pressed={aktif}
      onClick={(e) => {
        e.stopPropagation()
        const baru = aksi.toggleFavorit(idKelas)
        toast(baru ? 'Disimpan ke Kelas Favorit' : 'Dihapus dari Kelas Favorit')
      }}
      className={cn('flex size-8 items-center justify-center rounded-full', terang && 'bg-white shadow-sm', className)}
    >
      {aktif ? <MdFavorite className="size-6 text-[#F0384B]" /> : <MdFavoriteBorder className="size-6 text-[#A9A9B2]" />}
    </button>
  )
}

/** Kartu kelas: 'list' (Cari, Populer, Favorit) atau 'grid' (Beranda). */
export function CourseCard({ kelas, layout = 'list', favorit = true, onClick }) {
  const { db } = useDb()
  const { navigate } = useRouter()
  const kat = kategoriDari(db, kelas.idKategori)
  const menit = durasiKelas(db, kelas.id)
  const jumlah = pelajaranKelas(db, kelas.id).length
  const buka = onClick ?? (() => navigate(`/kelas/${kelas.id}`))
  if (layout === 'grid')
    return (
      <div data-testid="card-kelas" className="relative w-52 shrink-0 rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(36,37,44,0.07)]">
        <button type="button" onClick={buka} className="block w-full text-left">
          <CourseThumbnail kelas={kelas} className="h-32 w-full rounded-2xl text-5xl" />
          <p className="mt-4 line-clamp-2 min-h-14 text-lg leading-7 font-medium text-[#24252C]">
            {kelas.nama} <span className="text-sm font-normal text-[#A9A9B2]">({jumlah} Pelajaran)</span>
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#EEE9FF] px-2 py-1 text-sm text-[#5F33E1]">
              <TbClockHour4 className="size-5" />
              {formatDuration(menit)}
            </span>
            <Rating value={kelas.rating} />
          </div>
        </button>
        {favorit && <FavoriteButton idKelas={kelas.id} terang className="absolute top-6 right-6" />}
      </div>
    )
  return (
    <div data-testid="card-kelas" className="relative flex items-center gap-5 rounded-2xl bg-white p-3 shadow-[0_6px_20px_rgba(36,37,44,0.07)]">
      <button type="button" onClick={buka} className="flex min-w-0 flex-1 items-center gap-5 text-left">
        <CourseThumbnail kelas={kelas} className="h-[80px] w-[96px] shrink-0 rounded-xl text-3xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium text-[#24252C]">{kelas.nama}</p>
          <p className="mt-1 truncate text-sm text-[#8A8A94]">
            {kelas.tingkat} / {jumlah} pelajaran
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-[#A9A9B2]">
            <Rating value={kelas.rating} />
            <span>·</span>
            <span>{formatDuration(menit)}</span>
          </p>
          <span className="sr-only">{kat?.nama}</span>
        </div>
      </button>
      {favorit && <FavoriteButton idKelas={kelas.id} className="absolute right-3 bottom-3" />}
    </div>
  )
}
