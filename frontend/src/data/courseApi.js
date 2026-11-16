import { api } from '@/lib/api'
import { jikaAda } from '@/lib/learning'

// Sambungan halaman pelajar ke API katalog di backend (backend/src/routes/course.routes.js).
// Semua response berbentuk { data, message } (daftar juga membawa meta).
//   GET    /categories              daftar kategori
//   GET    /courses                 search, category, level, minRating, maxDurationMinutes, favoritesOnly, sort, page, limit
//   GET    /courses/popular         kelas terpopuler
//   GET    /courses/recommended     hasil engine rekomendasi
//   GET    /courses/:id             detail kelas + pelajaran + isEnrolled, isFavorite, myRating
//   POST   /courses/:id/enroll      ambil kelas
//   POST   /courses/:id/rating      rating 1-5 (hanya jika sudah ambil kelas)
//   POST   /courses/:id/favorite    tambah favorit; DELETE untuk menghapus
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
    jumlahRating: c.ratingsCount ?? 0,
    ratingSaya: c.myRating ?? null,
    skor: c.score,
    jumlahPelajar: c.studentsCount ?? 0,
    jumlahPelajaran: c.lessonsCount ?? c.lessons?.length ?? 0,
    durasi: Math.round((c.totalDurationSeconds ?? 0) / 60),
    detik: c.totalDurationSeconds ?? 0,
    favorit: Boolean(c.isFavorite),
    sudahIkut: Boolean(c.isEnrolled),
    pelajaran: (c.lessons ?? []).map((p) => ({
      id: p.id,
      judul: p.title,
      deskripsi: p.description,
      urlVideo: p.videoUrl || null,
      detik: p.durationSeconds ?? 0,
    })),
  }
}

// ponytail: halaman daftar belum memakai paginasi; ambil sampai 100 kelas sekaligus.
const BATAS = 100

/** Cari kelas. Filter yang tidak didukung server (beberapa tingkat sekaligus, durasi minimum) disaring di sini. */
export async function cariKelas({ q = '', idKategori = null, tingkat = [], ratingMin = 0, durasi = null, favoritSaja = false, urut } = {}) {
  const params = new URLSearchParams({ limit: BATAS })
  if (q.trim()) params.set('search', q.trim())
  if (idKategori) params.set('category', idKategori)
  if (tingkat.length === 1) params.set('level', LEVEL[tingkat[0]])
  if (ratingMin) params.set('minRating', ratingMin)
  if (durasi === 'pendek') params.set('maxDurationMinutes', 30)
  if (durasi === 'sedang') params.set('maxDurationMinutes', 60)
  if (favoritSaja) params.set('favoritesOnly', 'true')
  if (urut) params.set('sort', urut)
  const { data } = await api(`/courses?${params}`)
  return data
    .map(kelasDariServer)
    .filter((k) => !tingkat.length || tingkat.includes(k.tingkat))
    .filter((k) => (durasi === 'sedang' ? k.detik > 1800 : durasi === 'panjang' ? k.detik > 3600 : true))
}

export async function daftarKategori() {
  const { data } = await api('/categories')
  return data.map((k) => ({ id: k.id, nama: k.name, slug: k.slug }))
}

export async function kelasPopuler(batas = 10) {
  const { data } = await api(`/courses/popular?limit=${batas}`)
  return data.map(kelasDariServer)
}

export async function kelasRekomendasi(batas = 10) {
  const { data } = await api(`/courses/recommended?limit=${batas}`)
  return data.map(kelasDariServer)
}

/** Detail kelas; null bila id tidak valid atau kelas tidak ada (404). Galat jaringan/server dilempar. */
export const detailKelas = (id) => jikaAda(id, async () => kelasDariServer((await api(`/courses/${id}`)).data))

export async function ambilKelas(id) {
  const { data } = await api(`/courses/${id}/enroll`, { method: 'POST' })
  return data
}

export async function beriRating(id, rating) {
  const { data } = await api(`/courses/${id}/rating`, { method: 'POST', body: { rating } })
  return data
}

/** Menambah atau menghapus favorit. Mengembalikan true kalau sekarang jadi favorit. */
export async function ubahFavorit(id, jadiFavorit) {
  const { data } = await api(`/courses/${id}/favorite`, { method: jadiFavorit ? 'POST' : 'DELETE' })
  return data.isFavorite
}
