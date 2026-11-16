import { api, getToken } from '@/lib/api'
import { jikaAda } from '@/lib/learning'

// Sambungan halaman belajar dan gamifikasi ke backend (ProgressService, ChallengeService).
// Server membalas { data, message }; di sini hanya data yang dikembalikan.
const ambil = async (path, opsi) => (await api(path, opsi)).data

export const muatStatistik = () => ambil('/me/stats')
export const muatKelasSaya = () => ambil('/me/enrollments')
// null bila id tidak valid atau kelas tidak ditemukan/belum diambil (404)
export const muatProgresKelas = (idKelas) => jikaAda(idKelas, () => ambil(`/me/enrollments/${idKelas}`))
export const muatPelajaran = (idPelajaran) => jikaAda(idPelajaran, () => ambil(`/lessons/${idPelajaran}`))
export const tandaiSelesai = (idPelajaran, positionSeconds) =>
  ambil(`/lessons/${idPelajaran}/complete`, { method: 'POST', body: positionSeconds ? { positionSeconds } : {} })
// keepalive agar permintaan tetap terkirim saat tab ditutup (sendBeacon tidak bisa PUT berheader token)
export const simpanPosisi = (idPelajaran, positionSeconds, { keepalive = false } = {}) =>
  fetch(`/api/lessons/${idPelajaran}/position`, {
    method: 'PUT',
    keepalive,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ positionSeconds }),
  })
export const kirimReaksi = (idPelajaran, reaction) =>
  ambil(`/lessons/${idPelajaran}/reaction`, { method: 'PUT', body: { reaction } })
export const muatTantangan = () => ambil('/challenges/active')
export const selesaikanTantangan = (idTantangan) => ambil(`/challenges/${idTantangan}/complete`, { method: 'POST' })
