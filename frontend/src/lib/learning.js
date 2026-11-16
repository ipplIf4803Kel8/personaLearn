export const formatNomor = (n) => String(n).padStart(2, '0')

export const formatRibu = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n))

// Durasi dari detik: "45 dtk", "7 mnt", "7 mnt 5 dtk", "1 j 5 mnt". Tidak membulatkan; detik di atas 1 jam dibuang.
export function formatDurasi(detik) {
  const t = Math.max(0, Math.floor(Number(detik) || 0))
  const j = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const d = t % 60
  if (j) return m ? `${j} j ${m} mnt` : `${j} j`
  if (!m) return `${d} dtk`
  return d ? `${m} mnt ${d} dtk` : `${m} mnt`
}

// Id di alamat harus bilangan bulat positif; selain itu tidak perlu memanggil API.
export const idValid = (id) => /^[1-9]\d*$/.test(String(id))

// api() tidak membawa status HTTP, jadi 404 dikenali dari pesan server.
export const galatTidakDitemukan = (e) => /tidak ditemukan|belum Anda ambil/i.test(e?.message ?? '')

// Menjalankan fn; id tidak valid atau 404 menghasilkan null, galat lain (jaringan, 5xx) tetap dilempar.
export async function jikaAda(id, fn) {
  if (!idValid(id)) return null
  try {
    return await fn()
  } catch (e) {
    if (galatTidakDitemukan(e)) return null
    throw e
  }
}

// Mengubah tautan YouTube (watch, youtu.be, atau embed) menjadi tautan embed. Selain itu null.
export function youtubeEmbed(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    let id = null
    if (host === 'youtu.be') id = u.pathname.slice(1)
    else if (host === 'youtube.com' || host === 'm.youtube.com') {
      id = u.pathname.startsWith('/embed/') ? u.pathname.split('/')[2] : u.searchParams.get('v')
    }
    return id && /^[\w-]{6,}$/.test(id) ? `https://www.youtube.com/embed/${id}` : null
  } catch {
    return null
  }
}

// Tanggal lokal 'YYYY-MM-DD' (sama formatnya dengan tanggal dari server)
export const tanggalLokal = (d = new Date()) => d.toLocaleDateString('en-CA')

// Mengubah activity dari /me/stats menjadi satu entri per hari untuk `hari` hari terakhir (terlama dulu).
export function aktivitasPerHari(activity, hari, sekarang = new Date()) {
  const byDate = new Map(activity.map((a) => [a.date, a]))
  return Array.from({ length: hari }, (_, i) => {
    const d = new Date(sekarang)
    d.setDate(d.getDate() - (hari - 1 - i))
    const a = byDate.get(tanggalLokal(d))
    return { date: tanggalLokal(d), lessons: a?.lessons ?? 0, menit: Math.round((a?.seconds ?? 0) / 60), detik: a?.seconds ?? 0 }
  })
}

export function aktivitasKeCsv(hari) {
  return ['tanggal,pelajaran_selesai,menit', ...hari.filter((h) => h.lessons).map((h) => `${h.date},${h.lessons},${h.menit}`)].join('\n')
}
