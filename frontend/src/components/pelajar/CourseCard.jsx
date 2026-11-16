import { useEffect, useState } from 'react'
import { MdFavorite, MdFavoriteBorder, MdMenuBook, MdStar } from 'react-icons/md'
import { TbClockHour4 } from 'react-icons/tb'
import { useToast } from '@/components/pelajar/Toast'
import { formatDurasi } from '@/lib/learning'
import { useRouter } from '@/lib/router'
import { ubahFavorit } from '@/data/courseApi'
import { cn } from '@/lib/utils'

/** Sampul kelas: gambar dari admin, atau latar lavender + ikon buku jika belum ada gambar. */
export function CourseThumbnail({ kelas, className }) {
  if (kelas.gambar) return <img src={kelas.gambar} alt="" className={cn('object-cover', className)} />
  return (
    <div className={cn('flex items-center justify-center bg-[#E8E0FF]', className)}>
      <MdMenuBook aria-hidden="true" className="size-[1em] text-[#5F33E1]" />
    </div>
  )
}

/** Rating kelas; kelas tanpa rating tampil '-' */
export const formatRating = (v) => (Number(v) > 0 ? Number(v).toFixed(1) : '-')

export function Rating({ value, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm text-subtle', className)}>
      <MdStar className="size-5 text-[#FFC71E]" />
      {formatRating(value)}
    </span>
  )
}

/**
 * Tombol hati. awal = status favorit dari server; perubahan disimpan lewat API (POST/DELETE favorit).
 * onUbah(baru) dipanggil setelah berhasil (mis. untuk memuat ulang daftar).
 */
export function FavoriteButton({ idKelas, className, terang, awal = false, onUbah }) {
  const toast = useToast()
  const [aktif, setAktif] = useState(awal)
  const [menyimpan, setMenyimpan] = useState(false)
  useEffect(() => setAktif(awal), [awal])

  async function klik() {
    setMenyimpan(true)
    try {
      const baru = await ubahFavorit(idKelas, !aktif)
      setAktif(baru)
      toast(baru ? 'Disimpan ke Kelas Favorit' : 'Dihapus dari Kelas Favorit')
      onUbah?.(baru)
    } catch (err) {
      toast(err.message || 'Favorit gagal disimpan', 'gagal')
    } finally {
      setMenyimpan(false)
    }
  }
  return (
    <button
      type="button"
      aria-label={aktif ? 'Hapus dari favorit' : 'Simpan ke favorit'}
      aria-pressed={aktif}
      disabled={menyimpan}
      onClick={(e) => {
        e.stopPropagation()
        klik()
      }}
      className={cn('flex size-8 items-center justify-center rounded-full', terang && 'bg-white shadow-sm', className)}
    >
      {aktif ? <MdFavorite className="size-6 text-danger" /> : <MdFavoriteBorder className="size-6 text-subtle" />}
    </button>
  )
}

/** Kartu kelas: 'list' (Cari, Populer, Favorit) atau 'grid' (Beranda). */
export function CourseCard({ kelas, layout = 'list', favorit = true, onClick, onUbahFavorit }) {
  const { navigate } = useRouter()
  const durasi = formatDurasi(kelas.detik)
  const jumlah = kelas.jumlahPelajaran
  const hati = { idKelas: kelas.id, awal: kelas.favorit, onUbah: onUbahFavorit }
  const buka = onClick ?? (() => navigate(`/kelas/${kelas.id}`))
  if (layout === 'grid')
    return (
      <div data-testid="card-kelas" className="relative w-52 shrink-0 rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(36,37,44,0.07)]">
        <button type="button" onClick={buka} className="block w-full text-left">
          <CourseThumbnail kelas={kelas} className="h-32 w-full rounded-2xl text-5xl" />
          <p className="mt-4 line-clamp-2 min-h-14 text-lg leading-7 font-medium text-[#24252C]">
            {kelas.nama} <span className="text-sm font-normal text-subtle">({jumlah} Pelajaran)</span>
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#EEE9FF] px-2 py-1 text-sm text-[#5F33E1]">
              <TbClockHour4 className="size-5" />
              {durasi}
            </span>
            <Rating value={kelas.rating} />
          </div>
        </button>
        {favorit && <FavoriteButton {...hati} terang className="absolute top-6 right-6" />}
      </div>
    )
  return (
    <div data-testid="card-kelas" className="relative flex items-center gap-5 rounded-2xl bg-white p-3 shadow-[0_6px_20px_rgba(36,37,44,0.07)]">
      <button type="button" onClick={buka} className="flex min-w-0 flex-1 items-center gap-5 text-left">
        <CourseThumbnail kelas={kelas} className="h-[80px] w-[96px] shrink-0 rounded-xl text-3xl" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 pr-8 text-base break-words leading-snug font-medium text-[#24252C]">{kelas.nama}</p>
          <p className="mt-1 truncate pr-8 text-sm text-subtle">
            {kelas.tingkat} / {jumlah} pelajaran
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-subtle">
            <Rating value={kelas.rating} />
            <span>·</span>
            <span>{durasi}</span>
          </p>
          <span className="sr-only">{kelas.namaKategori}</span>
        </div>
      </button>
      {favorit && <FavoriteButton {...hati} className="absolute top-2 right-2" />}
    </div>
  )
}
