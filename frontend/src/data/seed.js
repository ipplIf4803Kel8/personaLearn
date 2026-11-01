// Data contoh awal untuk halaman pelajar (sementara, sampai API pelajar di backend siap).
// Isinya disamakan dengan data contoh backend (backend/scripts/seed.js): akun, kategori, kelas,
// pelajaran, kelas yang diikuti, tantangan, dan notifikasi. Data yang belum ada di backend
// (soal tantangan, poin/streak, ringkasan materi, riwayat belajar) hanya ada di sini.

const hariLalu = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

let pid = 0
const pel = (idKelas, urutan, judul, durasi, deskripsi) => ({
  id: (pid += 1),
  idKelas,
  urutan,
  judul,
  urlVideo: null, // sementara tanpa video: halaman menampilkan gambar materi
  durasi,
  deskripsi,
})

export function buatSeed() {
  pid = 0
  // backend: lessons (duration_seconds dibulatkan ke menit)
  const pelajaran = [
    pel(1, 1, 'Pengenalan JavaScript', 9, 'JavaScript adalah bahasa pemrograman yang membuat halaman web menjadi interaktif dan bisa dijalankan langsung di browser.'),
    pel(1, 2, 'Variabel dan Tipe Data', 10, 'Variabel menyimpan nilai. JavaScript punya tipe data seperti string, number, boolean, array, dan object.'),
    pel(1, 3, 'Fungsi dan Scope', 12, 'Fungsi membungkus langkah-langkah agar bisa dipanggil ulang. Scope menentukan di mana sebuah variabel bisa dipakai.'),
    pel(2, 1, 'Dasar Tipografi', 8, 'Tipografi mengatur jenis huruf, ukuran, dan jarak agar teks di antarmuka mudah dibaca.'),
    pel(2, 2, 'Teori Warna', 9, 'Teori warna membantu memilih kombinasi warna yang serasi dan memberi kontras yang cukup.'),
    pel(3, 1, 'Greeting dan Perkenalan', 7, 'Ungkapan menyapa dan memperkenalkan diri dalam bahasa Inggris, misalnya "Nice to meet you".'),
    pel(3, 2, 'Percakapan Sehari-hari', 8, 'Latihan percakapan ringan untuk situasi sehari-hari seperti di kampus, toko, atau tempat makan.'),
  ]

  return {
    versi: 3,
    sesi: null,
    simulasi: { koneksi: false },
    // backend: categories
    kategori: [
      { id: 1, nama: 'Pemrograman', ikon: '💻' },
      { id: 2, nama: 'Desain', ikon: '🎨' },
      { id: 3, nama: 'Bahasa', ikon: '🗣️' },
      { id: 4, nama: 'Bisnis', ikon: '📈' },
    ],
    // backend: courses (Beginner = Pemula, Intermediate = Menengah; is_published FALSE = draf; rating = rata-rata enrollments)
    kelas: [
      { id: 1, idKategori: 1, nama: 'Dasar Pemrograman JavaScript', deskripsi: 'Belajar fondasi JavaScript dari nol untuk pemula.', tingkat: 'Pemula', gambar: null, status: 'terbit', rating: 5, dibuatPada: hariLalu(60) },
      { id: 2, idKategori: 2, nama: 'Prinsip Desain UI Modern', deskripsi: 'Memahami tipografi, warna, dan tata letak untuk antarmuka digital.', tingkat: 'Menengah', gambar: null, status: 'terbit', rating: 4, dibuatPada: hariLalu(45) },
      { id: 3, idKategori: 3, nama: 'Bahasa Inggris Percakapan', deskripsi: 'Latihan percakapan bahasa Inggris untuk kebutuhan sehari-hari.', tingkat: 'Pemula', gambar: null, status: 'draf', rating: 4, dibuatPada: hariLalu(30) },
    ],
    pelajaran,
    // backend: courses.personality_tags / vark_tags -> jenis konten (structured = Terstruktur, reading = Teoritis,
    // exploratory = Praktik, collaborative = Reflektif)
    tagKonten: [
      { id: 1, idKelas: 1, idPelajaran: null, jenis: 'Terstruktur', tingkatKesulitan: 'Mudah' },
      { id: 2, idKelas: 1, idPelajaran: null, jenis: 'Teoritis', tingkatKesulitan: 'Mudah' },
      { id: 3, idKelas: 2, idPelajaran: null, jenis: 'Praktik', tingkatKesulitan: 'Sedang' },
      { id: 4, idKelas: 3, idPelajaran: null, jenis: 'Reflektif', tingkatKesulitan: 'Mudah' },
    ],
    // backend: users. Semua pelajar memakai sandi 'pelajar123'; admin sama dengan backend/.env.
    pengguna: [
      { id: 1, nama: 'Admin personaLearn', email: 'admin@personalearn.id', kataSandi: 'admin123', noTelepon: '', foto: null, peran: 'admin', aktif: true, tipeMbti: null, poin: 0, streak: 0, onboardingSelesai: true, dibuatPada: hariLalu(90) },
      { id: 2, nama: 'Samsul Arifin', email: 'samsul@example.com', kataSandi: 'pelajar123', noTelepon: '081234567890', foto: null, peran: 'pelajar', aktif: true, tipeMbti: 'INTP', poin: 120, streak: 3, onboardingSelesai: true, dibuatPada: hariLalu(58) },
      { id: 3, nama: 'Dewi Lestari', email: 'dewi@example.com', kataSandi: 'pelajar123', noTelepon: '081298765432', foto: null, peran: 'pelajar', aktif: true, tipeMbti: 'ENFJ', poin: 340, streak: 9, onboardingSelesai: true, dibuatPada: hariLalu(45) },
      { id: 4, nama: 'Budi Santoso', email: 'budi@example.com', kataSandi: 'pelajar123', noTelepon: '081355512345', foto: null, peran: 'pelajar', aktif: false, tipeMbti: null, poin: 0, streak: 0, onboardingSelesai: false, dibuatPada: hariLalu(3) },
    ],
    // backend: enrollments + lesson_progress
    kelasDiikuti: [
      { idPengguna: 2, idKelas: 1, progres: 67, selesai: [1, 2], pelajaranTerakhir: 2, tanggalAmbil: hariLalu(14) },
      { idPengguna: 2, idKelas: 2, progres: 20, selesai: [], pelajaranTerakhir: null, tanggalAmbil: hariLalu(7) },
      { idPengguna: 3, idKelas: 3, progres: 100, selesai: [6, 7], pelajaranTerakhir: 7, tanggalAmbil: hariLalu(25) },
    ],
    favorit: [],
    // backend: challenges (soal hanya ada di sini; tabel challenges di backend belum menyimpan soal)
    tantangan: [
      {
        id: 1,
        judul: 'Tuntaskan Dasar Pemrograman JavaScript',
        hadiahPoin: 100,
        soal: [
          { teks: 'JavaScript biasanya dijalankan di ...', opsi: ['Browser', 'Printer', 'Kalkulator', 'Router'], benar: 0 },
          { teks: 'Kata kunci untuk membuat variabel yang nilainya tetap adalah ...', opsi: ['var', 'let', 'const', 'fix'], benar: 2 },
          { teks: 'Tipe data untuk nilai benar atau salah adalah ...', opsi: ['string', 'boolean', 'number', 'array'], benar: 1 },
          { teks: 'Fungsi dipakai untuk ...', opsi: ['Menghapus variabel', 'Membungkus langkah agar bisa dipanggil ulang', 'Mengganti warna halaman', 'Menyimpan gambar'], benar: 1 },
          { teks: 'Variabel yang dibuat di dalam fungsi hanya bisa dipakai di dalam fungsi itu. Ini disebut ...', opsi: ['Scope', 'Loop', 'Array', 'Event'], benar: 0 },
        ],
      },
    ],
    tantanganPengguna: [],
    // backend: notifications
    notifikasi: [
      { id: 1, idPengguna: 2, judul: 'Tantangan baru sudah tersedia', pesan: 'Cek tantangan mingguan terbaru di halaman Kelas Saya.', jenis: 'Tantangan mingguan', tautan: '/tantangan', waktu: hariLalu(0), sudahDibaca: false },
      { id: 2, idPengguna: 3, judul: 'Tantangan baru sudah tersedia', pesan: 'Cek tantangan mingguan terbaru di halaman Kelas Saya.', jenis: 'Tantangan mingguan', tautan: '/tantangan', waktu: hariLalu(0), sudahDibaca: false },
    ],
    pengaturanNotifikasi: [
      { idPengguna: 2, aktif: true, jenis: ['Pengingat belajar', 'Tantangan mingguan', 'Rekomendasi AI'], waktuPengingat: '19:00', frekuensi: 'Harian' },
    ],
    // backend: chat_messages (balasan bot hanya ada di sini)
    riwayatObrolan: [],
    riwayatBelajar: [
      ...[13, 12, 10, 9, 7, 5, 4, 2, 1, 0].map((n, i) => ({ idPengguna: 2, tanggal: hariLalu(n), menit: [20, 35, 15, 40, 25, 30, 10, 45, 20, 15][i], materiSelesai: [1, 1, 0, 2, 1, 1, 0, 2, 1, 1][i] })),
      ...[6, 4, 3, 1].map((n, i) => ({ idPengguna: 3, tanggal: hariLalu(n), menit: [30, 25, 40, 20][i], materiSelesai: 1 })),
    ],
    penilaianVideo: [],
  }
}
