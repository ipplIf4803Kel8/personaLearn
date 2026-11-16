import { HiMegaphone, HiOutlineBell, HiReceiptPercent, HiTrophy, HiCheckBadge } from 'react-icons/hi2'

export const JENIS = {
  reminder: { label: 'Pengingat belajar', icon: HiMegaphone, warna: 'text-danger' },
  challenge: { label: 'Tantangan', icon: HiTrophy, warna: 'text-[#F59E0B]' },
  promo: { label: 'Promo & diskon', icon: HiReceiptPercent, warna: 'text-danger' },
  completion: { label: 'Kelas selesai', icon: HiCheckBadge, warna: 'text-[#22A45D]' },
  info: { label: 'Informasi', icon: HiOutlineBell, warna: 'text-[#5F33E1]' },
}

export const jenisNotifikasi = (type) => JENIS[type] ?? JENIS.info

/** Waktu relatif, mis. "5 Menit lalu", "1 Jam lalu", "Kemarin". */
export function waktuRelatif(iso) {
  const menit = Math.floor((Date.now() - new Date(iso).getTime()) / 6e4)
  if (menit < 1) return 'Baru saja'
  if (menit < 60) return `${menit} Menit lalu`
  if (menit < 1440) return `${Math.floor(menit / 60)} Jam lalu`
  const hari = Math.floor(menit / 1440)
  return hari === 1 ? 'Kemarin' : `${hari} Hari lalu`
}

// Lonceng membaca ulang jumlah belum dibaca setiap kali event ini dipicu
export const NOTIFIKASI_BERUBAH = 'notifikasi-berubah'
export const kabarkanNotifikasiBerubah = () => window.dispatchEvent(new Event(NOTIFIKASI_BERUBAH))
