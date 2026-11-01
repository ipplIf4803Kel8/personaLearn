import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { buatSeed } from './seed'
import { kelompokDariTipe } from './mbti'
import { clearAsyncCache } from '@/hooks/useAsync'

// Sumber data sementara untuk frontend (disimpan di localStorage).
// Setiap aksi bersifat async seperti pemanggilan API, jadi nanti tinggal diganti fetch ke backend.

const KUNCI = 'personalearn-db'
const DbContext = createContext(null)

function muat() {
  try {
    const simpan = JSON.parse(localStorage.getItem(KUNCI))
    if (simpan?.versi === 1) return simpan
  } catch {
    /* data rusak: mulai dari seed */
  }
  return buatSeed()
}

const jeda = (ms = 350) => new Promise((r) => setTimeout(r, ms))
export class GagalKoneksi extends Error {
  constructor() {
    super('Koneksi bermasalah')
  }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export function cekKataSandi(sandi) {
  if (!sandi || sandi.length < 8) return 'Kata sandi minimal 8 karakter, kombinasi huruf dan angka.'
  if (!/[A-Za-z]/.test(sandi) || !/\d/.test(sandi)) return 'Kata sandi minimal 8 karakter, kombinasi huruf dan angka.'
  return null
}
const nextId = (list) => Math.max(0, ...list.map((x) => x.id)) + 1

export function DbProvider({ children }) {
  const [db, setDb] = useState(muat)
  const ref = useRef(db)

  const commit = useCallback((ubah) => {
    const baru = typeof ubah === 'function' ? ubah(ref.current) : ubah
    ref.current = baru
    setDb(baru)
    try {
      localStorage.setItem(KUNCI, JSON.stringify(baru))
    } catch {
      /* kuota penuh (mis. foto besar): data tetap ada di memori */
    }
    return baru
  }, [])

  // Simulasi gangguan koneksi untuk menguji tampilan alur alternatif "koneksi bermasalah".
  const cekKoneksi = async (ms) => {
    await jeda(ms)
    if (ref.current.simulasi.koneksi) throw new GagalKoneksi()
  }
  const pengguna = () => ref.current.pengguna.find((u) => u.id === ref.current.sesi?.idPengguna) ?? null
  const ubahPengguna = (id, data) =>
    commit((d) => ({ ...d, pengguna: d.pengguna.map((u) => (u.id === id ? { ...u, ...data } : u)) }))

  const aksi = useMemo(
    () => ({
      // ------------------------------------------------------------ umum
      setSimulasiKoneksi: (aktif) => commit((d) => ({ ...d, simulasi: { ...d.simulasi, koneksi: aktif } })),
      resetData: () => {
        clearAsyncCache()
        commit(buatSeed())
      },

      // ------------------------------------------------------------ UC1 Autentikasi
      async daftar({ email, kataSandi, konfirmasi }) {
        await jeda()
        const err = {}
        if (!EMAIL_RE.test(email)) err.email = 'Format email belum benar.'
        else if (ref.current.pengguna.some((u) => u.email.toLowerCase() === email.toLowerCase())) err.email = 'Email sudah terdaftar.'
        const sandiErr = cekKataSandi(kataSandi)
        if (sandiErr) err.kataSandi = sandiErr
        if (kataSandi !== konfirmasi) err.konfirmasi = 'Konfirmasi kata sandi tidak sama.'
        if (Object.keys(err).length) return { ok: false, err }
        commit((d) => ({
          ...d,
          pengguna: [
            ...d.pengguna,
            { id: nextId(d.pengguna), nama: email.split('@')[0], email, kataSandi, noTelepon: '', foto: null, peran: 'pelajar', tipeMbti: null, poin: 0, streak: 0, onboardingSelesai: false, dibuatPada: new Date().toISOString() },
          ],
        }))
        return { ok: true }
      },
      async masuk({ email, kataSandi, peran = 'pelajar' }) {
        await jeda()
        const u = ref.current.pengguna.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
        if (!u || u.kataSandi !== kataSandi || (peran === 'admin' && u.peran !== 'admin'))
          return { ok: false, pesan: 'Email atau kata sandi tidak cocok. Periksa kembali, ya.' }
        commit((d) => ({ ...d, sesi: { idPengguna: u.id, peran: u.peran } }))
        return { ok: true, pengguna: u }
      },
      async masukOAuth(penyedia) {
        await jeda()
        const email = `${penyedia.toLowerCase()}.pelajar@example.com`
        let u = ref.current.pengguna.find((x) => x.email === email)
        if (!u) {
          u = { id: nextId(ref.current.pengguna), nama: `Pengguna ${penyedia}`, email, kataSandi: null, noTelepon: '', foto: null, peran: 'pelajar', tipeMbti: null, poin: 0, streak: 0, onboardingSelesai: false, dibuatPada: new Date().toISOString() }
          commit((d) => ({ ...d, pengguna: [...d.pengguna, u] }))
        }
        commit((d) => ({ ...d, sesi: { idPengguna: u.id, peran: u.peran } }))
        return { ok: true, pengguna: u }
      },
      async kirimTautanAturUlang(email) {
        await jeda()
        if (!EMAIL_RE.test(email)) return { ok: false, pesan: 'Format email belum benar.' }
        const u = ref.current.pengguna.find((x) => x.email.toLowerCase() === email.toLowerCase())
        if (!u) return { ok: false, pesan: 'Email belum terdaftar. Periksa lagi ya.' }
        return { ok: true }
      },
      async aturUlangKataSandi(email, baru, konfirmasi) {
        await jeda()
        const err = {}
        const e = cekKataSandi(baru)
        if (e) err.baru = e
        if (baru !== konfirmasi) err.konfirmasi = 'Konfirmasi kata sandi tidak sama.'
        if (Object.keys(err).length) return { ok: false, err }
        commit((d) => ({ ...d, pengguna: d.pengguna.map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, kataSandi: baru } : u)) }))
        return { ok: true }
      },
      async simpanTipeMbtiAwal(tipe) {
        await jeda(250)
        ubahPengguna(ref.current.sesi.idPengguna, { tipeMbti: tipe, onboardingSelesai: true })
        return { ok: true }
      },
      keluar: () => {
        clearAsyncCache()
        commit((d) => ({ ...d, sesi: null }))
      },

      // ------------------------------------------------------------ UC2 Eksplorasi Kelas
      async cariKelas({ q = '', idKategori = null, tingkat = [], ratingMin = 0, durasi = null } = {}) {
        await cekKoneksi(300)
        const d = ref.current
        return d.kelas.filter((k) => {
          if (k.status !== 'terbit') return false
          if (q && !`${k.nama} ${k.deskripsi}`.toLowerCase().includes(q.toLowerCase())) return false
          if (idKategori && k.idKategori !== idKategori) return false
          if (tingkat.length && !tingkat.includes(k.tingkat)) return false
          if (ratingMin && k.rating < ratingMin) return false
          const menit = durasiKelas(d, k.id)
          if (durasi === 'pendek' && menit > 30) return false
          if (durasi === 'sedang' && (menit <= 30 || menit > 60)) return false
          if (durasi === 'panjang' && menit <= 60) return false
          return true
        })
      },
      async kelasPopuler() {
        await cekKoneksi(300)
        return kelasPopulerSync(ref.current)
      },
      toggleFavorit(idKelas) {
        const id = ref.current.sesi.idPengguna
        const ada = ref.current.favorit.some((f) => f.idPengguna === id && f.idKelas === idKelas)
        commit((d) => ({
          ...d,
          favorit: ada ? d.favorit.filter((f) => !(f.idPengguna === id && f.idKelas === idKelas)) : [...d.favorit, { idPengguna: id, idKelas }],
        }))
        return !ada
      },
      async ambilKelas(idKelas) {
        await cekKoneksi(400)
        const id = ref.current.sesi.idPengguna
        if (!ref.current.kelasDiikuti.some((k) => k.idPengguna === id && k.idKelas === idKelas))
          commit((d) => ({
            ...d,
            kelasDiikuti: [...d.kelasDiikuti, { idPengguna: id, idKelas, progres: 0, selesai: [], pelajaranTerakhir: null, tanggalAmbil: new Date().toISOString() }],
          }))
        return { ok: true }
      },

      // ------------------------------------------------------------ UC3 Kemajuan
      async muatRingkasan() {
        await cekKoneksi(250)
        return true
      },
      // Menyimpan progres satu pelajaran lalu menjalankan "Analisis Kemajuan AI".
      async simpanProgres(idKelas, idPelajaran) {
        await cekKoneksi(300)
        const d = ref.current
        const id = d.sesi.idPengguna
        const daftar = d.pelajaran.filter((p) => p.idKelas === idKelas)
        const kd = d.kelasDiikuti.find((k) => k.idPengguna === id && k.idKelas === idKelas)
        if (!kd) return { ok: false }
        const baruSelesai = !kd.selesai.includes(idPelajaran)
        const selesai = baruSelesai ? [...kd.selesai, idPelajaran] : kd.selesai
        const progres = Math.round((selesai.length / Math.max(1, daftar.length)) * 100)
        const menit = d.pelajaran.find((p) => p.id === idPelajaran)?.durasi ?? 10
        const hariIni = new Date().toDateString()
        const belajarHariIni = d.riwayatBelajar.some((r) => r.idPengguna === id && new Date(r.tanggal).toDateString() === hariIni)
        commit((x) => ({
          ...x,
          kelasDiikuti: x.kelasDiikuti.map((k) => (k === kd ? { ...k, selesai, progres, pelajaranTerakhir: idPelajaran } : k)),
          riwayatBelajar: [...x.riwayatBelajar, { idPengguna: id, tanggal: new Date().toISOString(), menit, materiSelesai: baruSelesai ? 1 : 0 }],
          pengguna: x.pengguna.map((u) => (u.id === id && !belajarHariIni ? { ...u, streak: u.streak + 1 } : u)),
        }))
        // Analisis Kemajuan AI (aturan sederhana): progres naik >= 50% => tinggi, < 34% => rendah.
        let hasil = null
        if (baruSelesai && progres >= 50) {
          hasil = { jenis: 'tinggi', poin: 20 }
          ubahPengguna(id, { poin: pengguna().poin + 20 })
        } else if (baruSelesai && progres < 34) {
          hasil = { jenis: 'rendah', saran: saranMateri(ref.current, idKelas, id) }
        }
        return { ok: true, progres, hasil }
      },
      async eksporDataProgres() {
        await cekKoneksi(500)
        const d = ref.current
        const id = d.sesi.idPengguna
        const baris = [['tanggal', 'menit_belajar', 'materi_selesai']]
        d.riwayatBelajar
          .filter((r) => r.idPengguna === id)
          .forEach((r) => baris.push([r.tanggal.slice(0, 10), r.menit, r.materiSelesai]))
        baris.push([])
        baris.push(['kelas', 'progres_persen'])
        d.kelasDiikuti
          .filter((k) => k.idPengguna === id)
          .forEach((k) => baris.push([d.kelas.find((x) => x.id === k.idKelas)?.nama ?? '-', k.progres]))
        return baris.map((b) => b.join(',')).join('\n')
      },
      async selesaikanTantangan(idTantangan, jumlahBenar) {
        await cekKoneksi(300)
        const d = ref.current
        const id = d.sesi.idPengguna
        const t = d.tantangan.find((x) => x.id === idTantangan)
        const sudah = d.tantanganPengguna.some((x) => x.idPengguna === id && x.idTantangan === idTantangan)
        if (!sudah) {
          commit((x) => ({
            ...x,
            tantanganPengguna: [...x.tantanganPengguna, { idPengguna: id, idTantangan, jumlahBenar, tanggalSelesai: new Date().toISOString() }],
          }))
          ubahPengguna(id, { poin: pengguna().poin + t.hadiahPoin })
        }
        return { ok: true, poin: sudah ? 0 : t.hadiahPoin }
      },

      // ------------------------------------------------------------ UC4 Profil
      async simpanProfil({ nama, foto, tipeMbti }) {
        await cekKoneksi(350)
        if (!nama?.trim()) return { ok: false, pesan: 'Nama tidak boleh kosong.' }
        ubahPengguna(ref.current.sesi.idPengguna, { nama: nama.trim(), foto, tipeMbti: tipeMbti || null, onboardingSelesai: true })
        return { ok: true }
      },
      async ubahKataSandi({ lama, baru, konfirmasi }) {
        await cekKoneksi(350)
        const u = pengguna()
        if (u.kataSandi !== lama) return { ok: false, err: { lama: 'Kata sandi lama salah.' } }
        const e = cekKataSandi(baru)
        if (e) return { ok: false, err: { baru: e } }
        if (baru !== konfirmasi) return { ok: false, err: { konfirmasi: 'Konfirmasi kata sandi tidak sama.' } }
        ubahPengguna(u.id, { kataSandi: baru })
        return { ok: true }
      },

      // ------------------------------------------------------------ UC5 Notifikasi
      async muatNotifikasi() {
        await cekKoneksi(300)
        return true
      },
      tandaiDibaca(idNotifikasi) {
        commit((d) => ({ ...d, notifikasi: d.notifikasi.map((n) => (n.id === idNotifikasi ? { ...n, sudahDibaca: true } : n)) }))
      },
      async simpanPengaturanNotifikasi(data) {
        await cekKoneksi(400)
        const id = ref.current.sesi.idPengguna
        commit((d) => ({
          ...d,
          pengaturanNotifikasi: [...d.pengaturanNotifikasi.filter((p) => p.idPengguna !== id), { idPengguna: id, ...data }],
        }))
        return { ok: true }
      },

      // ------------------------------------------------------------ UC6 Rekomendasi & Sinau Bot
      async rekomendasi() {
        await cekKoneksi(400)
        return rekomendasiSync(ref.current, ref.current.sesi.idPengguna)
      },
      async tanyaSinauBot(idPelajaran, teks) {
        await cekKoneksi(600)
        const d = ref.current
        const id = d.sesi.idPengguna
        const p = d.pelajaran.find((x) => x.id === idPelajaran)
        const jawaban = jawabSinauBot(p, teks)
        commit((x) => ({
          ...x,
          riwayatObrolan: [
            ...x.riwayatObrolan,
            { id: nextId(x.riwayatObrolan), idPengguna: id, idPelajaran, pesan: teks, pengirim: 'pelajar', waktu: new Date().toISOString() },
            { id: nextId(x.riwayatObrolan) + 1, idPengguna: id, idPelajaran, pesan: jawaban, pengirim: 'bot', waktu: new Date().toISOString() },
          ],
        }))
        // Deteksi kesulitan: kata kunci kebingungan atau sudah 3 pertanyaan di pelajaran yang sama.
        const jumlahTanya = ref.current.riwayatObrolan.filter((o) => o.idPengguna === id && o.idPelajaran === idPelajaran && o.pengirim === 'pelajar').length
        const kesulitan = /bingung|tidak paham|nggak ngerti|gak ngerti|susah|sulit/i.test(teks) || jumlahTanya >= 3
        return { jawaban, kesulitan }
      },
      nilaiVideo(idPelajaran, nilai) {
        const id = ref.current.sesi.idPengguna
        commit((d) => ({
          ...d,
          penilaianVideo: [...d.penilaianVideo.filter((v) => !(v.idPengguna === id && v.idPelajaran === idPelajaran)), { idPengguna: id, idPelajaran, nilai }],
        }))
      },

      // ------------------------------------------------------------ UC7 Kategori (admin)
      async simpanKategori({ id, nama, ikon }) {
        await jeda(250)
        if (!nama?.trim()) return { ok: false, pesan: 'Nama kategori wajib diisi.' }
        if (ref.current.kategori.some((k) => k.nama.toLowerCase() === nama.trim().toLowerCase() && k.id !== id))
          return { ok: false, pesan: 'Nama kategori sudah dipakai.' }
        commit((d) => ({
          ...d,
          kategori: id
            ? d.kategori.map((k) => (k.id === id ? { ...k, nama: nama.trim(), ikon } : k))
            : [...d.kategori, { id: nextId(d.kategori), nama: nama.trim(), ikon }],
        }))
        return { ok: true }
      },
      async hapusKategori(id) {
        await jeda(250)
        if (ref.current.kelas.some((k) => k.idKategori === id))
          return { ok: false, pesan: 'Kategori masih dipakai kelas. Pindahkan kelasnya ke kategori lain terlebih dahulu.' }
        commit((d) => ({ ...d, kategori: d.kategori.filter((k) => k.id !== id) }))
        return { ok: true }
      },

      // ------------------------------------------------------------ UC8 Kelas (admin)
      async simpanKelas(data, status) {
        await jeda(300)
        if (!data.nama?.trim() || !data.idKategori) return { ok: false, pesan: 'Lengkapi semua data wajib terlebih dahulu.' }
        const d = ref.current
        const punyaPelajaran = data.id && d.pelajaran.some((p) => p.idKelas === data.id)
        if (status === 'terbit' && !punyaPelajaran)
          return { ok: false, pesan: 'Publikasi ditolak. Tambahkan minimal satu pelajaran terlebih dahulu.' }
        let idBaru = data.id
        commit((x) => {
          if (data.id) return { ...x, kelas: x.kelas.map((k) => (k.id === data.id ? { ...k, ...data, nama: data.nama.trim(), status } : k)) }
          idBaru = nextId(x.kelas)
          return { ...x, kelas: [...x.kelas, { rating: 0, gambar: null, ...data, id: idBaru, nama: data.nama.trim(), status, dibuatPada: new Date().toISOString() }] }
        })
        return { ok: true, id: idBaru }
      },
      async hapusKelas(id) {
        await jeda(300)
        const diikuti = ref.current.kelasDiikuti.some((k) => k.idKelas === id)
        if (diikuti) {
          commit((d) => ({ ...d, kelas: d.kelas.map((k) => (k.id === id ? { ...k, status: 'disembunyikan' } : k)) }))
          return { ok: true, disembunyikan: true }
        }
        commit((d) => ({
          ...d,
          kelas: d.kelas.filter((k) => k.id !== id),
          pelajaran: d.pelajaran.filter((p) => p.idKelas !== id),
          tagKonten: d.tagKonten.filter((t) => t.idKelas !== id),
          favorit: d.favorit.filter((f) => f.idKelas !== id),
        }))
        return { ok: true, disembunyikan: false }
      },

      // ------------------------------------------------------------ UC9 Pelajaran (admin)
      async unggahVideo(file) {
        await cekKoneksi(900)
        return { ok: true, url: file ? URL.createObjectURL(file) : '' }
      },
      async simpanPelajaran(data) {
        await jeda(300)
        if (!data.judul?.trim() || !data.urlVideo) return { ok: false, pesan: 'Judul dan video wajib diisi sebelum disimpan.' }
        commit((d) => {
          if (data.id) return { ...d, pelajaran: d.pelajaran.map((p) => (p.id === data.id ? { ...p, ...data, judul: data.judul.trim() } : p)) }
          const urutan = d.pelajaran.filter((p) => p.idKelas === data.idKelas).length + 1
          return { ...d, pelajaran: [...d.pelajaran, { ...data, judul: data.judul.trim(), id: nextId(d.pelajaran), urutan }] }
        })
        hitungUlangProgres(data.idKelas)
        return { ok: true }
      },
      async simpanUrutan(idKelas, idUrut) {
        await jeda(250)
        commit((d) => ({
          ...d,
          pelajaran: d.pelajaran.map((p) => (p.idKelas === idKelas ? { ...p, urutan: idUrut.indexOf(p.id) + 1 } : p)),
        }))
        return { ok: true }
      },
      sudahDitonton: (idPelajaran) => ref.current.kelasDiikuti.some((k) => k.selesai.includes(idPelajaran)),
      async hapusPelajaran(idPelajaran) {
        await jeda(250)
        const p = ref.current.pelajaran.find((x) => x.id === idPelajaran)
        commit((d) => {
          const sisa = d.pelajaran.filter((x) => x.id !== idPelajaran)
          let urutan = 0
          return {
            ...d,
            pelajaran: sisa.map((x) => (x.idKelas === p.idKelas ? { ...x, urutan: (urutan += 1) } : x)).sort((a, b) => a.id - b.id),
            kelasDiikuti: d.kelasDiikuti.map((k) => ({ ...k, selesai: k.selesai.filter((s) => s !== idPelajaran) })),
            tagKonten: d.tagKonten.filter((t) => t.idPelajaran !== idPelajaran),
          }
        })
        hitungUlangProgres(p.idKelas)
        return { ok: true }
      },

      // ------------------------------------------------------------ UC10 Tag (admin) + pembaruan rekomendasi
      async simpanTag({ idKelas, idPelajaran = null, jenis, tingkatKesulitan }) {
        await jeda(300)
        if (!jenis?.length) return { ok: false, pesan: 'Pilih minimal satu tag jenis konten.' }
        commit((d) => {
          const lain = d.tagKonten.filter((t) => !(t.idKelas === idKelas && (t.idPelajaran ?? null) === (idPelajaran ?? null)))
          let id = nextId(d.tagKonten)
          const baru = jenis.map((j) => ({ id: id++, idKelas, idPelajaran, jenis: j, tingkatKesulitan }))
          return { ...d, tagKonten: [...lain, ...baru] }
        })
        return { ok: true }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commit],
  )

  function hitungUlangProgres(idKelas) {
    commit((d) => {
      const total = Math.max(1, d.pelajaran.filter((p) => p.idKelas === idKelas).length)
      return {
        ...d,
        kelasDiikuti: d.kelasDiikuti.map((k) => (k.idKelas === idKelas ? { ...k, progres: Math.min(100, Math.round((k.selesai.length / total) * 100)) } : k)),
      }
    })
  }

  const value = useMemo(() => ({ db, aksi }), [db, aksi])
  return <DbContext.Provider value={value}>{children}</DbContext.Provider>
}

export function useDb() {
  const ctx = useContext(DbContext)
  if (!ctx) throw new Error('useDb harus dipakai di dalam DbProvider')
  return ctx
}

// ------------------------------------------------------------------ selector (fungsi baca)
export function penggunaAktif(db) {
  return db.pengguna.find((u) => u.id === db.sesi?.idPengguna) ?? null
}
export function durasiKelas(db, idKelas) {
  return db.pelajaran.filter((p) => p.idKelas === idKelas).reduce((s, p) => s + Number(p.durasi || 0), 0)
}
export function pelajaranKelas(db, idKelas) {
  return db.pelajaran.filter((p) => p.idKelas === idKelas).sort((a, b) => a.urutan - b.urutan)
}
export function jumlahPelajar(db, idKelas) {
  return db.kelasDiikuti.filter((k) => k.idKelas === idKelas).length
}
export function kategoriDari(db, idKategori) {
  return db.kategori.find((k) => k.id === idKategori) ?? null
}
export function tagKelas(db, idKelas) {
  return [...new Set(db.tagKonten.filter((t) => t.idKelas === idKelas && !t.idPelajaran).map((t) => t.jenis))]
}
export function kelasDiikutiSaya(db) {
  const id = db.sesi?.idPengguna
  return db.kelasDiikuti
    .filter((k) => k.idPengguna === id)
    .map((k) => ({ ...k, kelas: db.kelas.find((x) => x.id === k.idKelas) }))
    .filter((k) => k.kelas)
}
export function kelasPopulerSync(db) {
  return db.kelas
    .filter((k) => k.status === 'terbit')
    .map((k) => ({ k, skor: jumlahPelajar(db, k.id) * 2 + k.rating }))
    .sort((a, b) => b.skor - a.skor)
    .map((x) => x.k)
}
export function rekomendasiSync(db, idPengguna) {
  const u = db.pengguna.find((x) => x.id === idPengguna)
  const kelompok = kelompokDariTipe(u?.tipeMbti)
  const diikuti = new Set(db.kelasDiikuti.filter((k) => k.idPengguna === idPengguna).map((k) => k.idKelas))
  const terbit = db.kelas.filter((k) => k.status === 'terbit')
  if (!kelompok) {
    // Rekomendasi cadangan: kelas populer yang belum diikuti, lalu kategori kelas yang diikuti.
    const kategoriDiikuti = new Set(terbit.filter((k) => diikuti.has(k.id)).map((k) => k.idKategori))
    const kelas = kelasPopulerSync(db)
      .filter((k) => !diikuti.has(k.id))
      .sort((a, b) => Number(kategoriDiikuti.has(b.idKategori)) - Number(kategoriDiikuti.has(a.idKategori)))
    return { kelompok: null, tipe: null, kelas }
  }
  const cocok = terbit.filter((k) => tagKelas(db, k.id).includes(kelompok.tag))
  const kelas = [...cocok.filter((k) => !diikuti.has(k.id)), ...cocok.filter((k) => diikuti.has(k.id))]
  return { kelompok, tipe: u.tipeMbti, kelas }
}
function saranMateri(db, idKelas, idPengguna) {
  const kd = db.kelasDiikuti.find((k) => k.idPengguna === idPengguna && k.idKelas === idKelas)
  const belum = pelajaranKelas(db, idKelas).filter((p) => !kd?.selesai.includes(p.id))
  return belum.slice(0, 2)
}
function jawabSinauBot(pelajaran, teks) {
  const t = teks.toLowerCase()
  if (!pelajaran) return 'Maaf, materi ini belum bisa saya temukan.'
  if (/contoh/.test(t)) return `Contoh sederhana untuk "${pelajaran.judul}": ${pelajaran.deskripsi} Coba praktikkan pada satu kasus kecil dulu, lalu bandingkan hasilnya dengan penjelasan di video.`
  if (/ringkas|rangkum|inti/.test(t)) return `Inti dari "${pelajaran.judul}": ${pelajaran.deskripsi}`
  if (/kenapa|mengapa/.test(t)) return `Ini penting karena ${pelajaran.deskripsi.charAt(0).toLowerCase()}${pelajaran.deskripsi.slice(1)} Dengan memahaminya, materi berikutnya akan lebih mudah diikuti.`
  return `Pertanyaan bagus! Berdasarkan materi "${pelajaran.judul}": ${pelajaran.deskripsi} Kalau masih ada yang belum jelas, tanyakan bagian mana yang membingungkan.`
}
