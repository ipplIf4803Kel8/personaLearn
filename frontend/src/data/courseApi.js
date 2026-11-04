import { api } from '@/lib/api'

// Sambungan halaman pelajar ke API kelas di backend (backend/src/services/course.service.js):
//   GET  /courses               cari kelas (q, categoryId, level, minRating, maxDurationMinutes, favoritesOnly, sort)
//   GET  /courses/:id           detail kelas + daftar pelajaran + isEnrolled
//   POST /courses/:id/enroll    ambil kelas
//   POST /courses/:id/favorite  simpan / hapus favorit
// Data dari server diubah ke bentuk yang sudah dipakai komponen pelajar (nama, tingkat, durasi, ...).

const TINGKAT = { Beginner: 'Pemula', Intermediate: 'Menengah', Advanced: 'Lanjut' }
const LEVEL = { Pemula: 'Beginner', Menengah: 'Intermediate', Lanjut: 'Advanced' }

export function kelasDariServer(c) {
  return {
    id: c.id,
    idKategori: c.categoryId,
    namaKategori: c.categoryName,
    nama: c.title,
    deskripsi: c.description,
    tingkat: TINGKAT[c.level] ?? c.level,
    gambar: c.thumbnailUrl || null,
    rating: c.rating ?? 0,
    jumlahPelajar: c.studentsCount ?? 0,
    jumlahPelajaran: c.lessonsCount ?? c.lessons?.length ?? 0,
    durasi: Math.round((c.totalDurationSeconds ?? 0) / 60),
    favorit: Boolean(c.isFavorite),
    sudahIkut: Boolean(c.isEnrolled),
    pelajaran: (c.lessons ?? []).map((p) => ({
      id: p.id,
      judul: p.title,
      deskripsi: p.description,
      urlVideo: p.videoUrl || null,
      durasi: Math.round((p.durationSeconds ?? 0) / 60),
    })),
    dariServer: true,
  }
}

/** Cari kelas. Filter yang tidak didukung server (beberapa tingkat sekaligus, durasi minimum) disaring di sini. */
export async function cariKelas({ q = '', idKategori = null, tingkat = [], ratingMin = 0, durasi = null, favoritSaja = false, urut } = {}) {
  const params = new URLSearchParams()
  if (q.trim()) params.set('q', q.trim())
  if (idKategori) params.set('categoryId', idKategori)
  if (tingkat.length === 1) params.set('level', LEVEL[tingkat[0]])
  if (ratingMin) params.set('minRating', ratingMin)
  if (durasi === 'pendek') params.set('maxDurationMinutes', 30)
  if (durasi === 'sedang') params.set('maxDurationMinutes', 60)
  if (favoritSaja) params.set('favoritesOnly', 'true')
  if (urut) params.set('sort', urut)
  const data = await api(`/courses?${params}`)
  return data
    .map(kelasDariServer)
    .filter((k) => !tingkat.length || tingkat.includes(k.tingkat))
    .filter((k) => (durasi === 'sedang' ? k.durasi > 30 : durasi === 'panjang' ? k.durasi > 60 : true))
}

export const kelasPopuler = () => cariKelas({ urut: 'popular' })

export async function detailKelas(id) {
  return kelasDariServer(await api(`/courses/${id}`))
}

export const ambilKelas = (id) => api(`/courses/${id}/enroll`, { method: 'POST' })

/** Mengembalikan true kalau sekarang jadi favorit. */
export async function ubahFavorit(id) {
  const r = await api(`/courses/${id}/favorite`, { method: 'POST' })
  return r.isFavorite
}
