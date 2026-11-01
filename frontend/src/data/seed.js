// Data contoh awal. Struktur mengikuti tabel di ERD (backend/db/migrations/002_skema_elearning.sql),
// dengan penamaan camelCase di sisi JavaScript.

const VIDEO = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
]

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
  urlVideo: VIDEO[pid % 2],
  durasi,
  deskripsi,
})

export function buatSeed() {
  pid = 0
  const pelajaran = [
    pel(1, 1, 'Apa itu UX Design?', 8, 'UX design adalah proses merancang pengalaman pengguna agar produk mudah, efektif, dan menyenangkan dipakai.'),
    pel(1, 2, 'Memahami Kebutuhan Pengguna', 12, 'Kebutuhan pengguna digali lewat wawancara, observasi, dan persona agar desain menjawab masalah nyata.'),
    pel(1, 3, 'Wireframe Pertama', 15, 'Wireframe adalah kerangka tata letak berfidelitas rendah untuk menguji alur sebelum masuk ke desain visual.'),
    pel(1, 4, 'Uji Kegunaan Sederhana', 10, 'Uji kegunaan meminta pengguna menyelesaikan tugas sambil diamati untuk menemukan bagian yang membingungkan.'),
    pel(1, 5, 'Iterasi Desain', 9, 'Hasil uji dipakai untuk memperbaiki desain secara bertahap sampai alurnya lancar.'),
    pel(2, 1, 'Mengenal Teknik Skimming', 7, 'Skimming membaca cepat bagian penting seperti judul, kalimat pertama paragraf, dan kesimpulan.'),
    pel(2, 2, 'Teknik Scanning', 8, 'Scanning mencari informasi tertentu, misalnya angka atau nama, tanpa membaca seluruh teks.'),
    pel(2, 3, 'Membuat Catatan Bacaan', 11, 'Catatan bacaan merangkum gagasan utama dengan kata-kata sendiri agar mudah diingat.'),
    pel(3, 1, 'Variabel dan Tipe Data', 12, 'Variabel menyimpan nilai. JavaScript punya tipe data seperti string, number, boolean, array, dan object.'),
    pel(3, 2, 'Percabangan if/else', 10, 'Percabangan menjalankan kode berbeda tergantung kondisi benar atau salah.'),
    pel(3, 3, 'Perulangan for dan while', 14, 'Perulangan menjalankan blok kode berulang kali selama kondisi terpenuhi.'),
    pel(3, 4, 'Fungsi', 13, 'Fungsi membungkus langkah-langkah agar bisa dipanggil ulang dengan parameter berbeda.'),
    pel(4, 1, 'Merencanakan Riset', 10, 'Rencana riset menentukan tujuan, pertanyaan, peserta, dan metode yang dipakai.'),
    pel(4, 2, 'Wawancara Pengguna', 16, 'Wawancara memakai pertanyaan terbuka untuk menggali pengalaman dan alasan pengguna.'),
    pel(4, 3, 'Menyusun Insight', 12, 'Temuan riset dikelompokkan dengan affinity diagram lalu dirumuskan menjadi insight.'),
    pel(5, 1, 'Array dan Linked List', 15, 'Array menyimpan data berurutan di memori, sedangkan linked list menghubungkan node lewat pointer.'),
    pel(5, 2, 'Stack dan Queue', 12, 'Stack bekerja LIFO (terakhir masuk pertama keluar), queue bekerja FIFO (pertama masuk pertama keluar).'),
    pel(5, 3, 'Tree dan Graph', 18, 'Tree adalah struktur hierarki tanpa siklus, graph menghubungkan simpul dengan sisi dan boleh bersiklus.'),
    pel(6, 1, 'Perkenalan Diri', 8, 'Latihan memperkenalkan diri: nama, asal, pekerjaan, dan hobi dalam bahasa Inggris.'),
    pel(6, 2, 'Small Talk', 9, 'Small talk membahas topik ringan seperti cuaca, akhir pekan, atau kegiatan sehari-hari.'),
    pel(6, 3, 'Bertanya Arah', 7, 'Ungkapan untuk bertanya dan memberi arah, misalnya "turn left" dan "go straight".'),
    pel(7, 1, 'Jurnal Harian', 9, 'Jurnal harian melatih menuliskan pengalaman dan perasaan secara jujur setiap hari.'),
    pel(7, 2, 'Model Refleksi Gibbs', 13, 'Siklus Gibbs: deskripsi, perasaan, evaluasi, analisis, kesimpulan, dan rencana tindakan.'),
  ]

  return {
    versi: 1,
    sesi: null,
    simulasi: { koneksi: false },
    kategori: [
      { id: 1, nama: 'Membaca', ikon: '📖' },
      { id: 2, nama: 'UX Design', ikon: '🎨' },
      { id: 3, nama: 'Pemrograman', ikon: '💻' },
      { id: 4, nama: 'Bahasa Inggris', ikon: '🗣️' },
      { id: 5, nama: 'Bisnis', ikon: '📈' },
    ],
    kelas: [
      { id: 1, idKategori: 2, nama: 'Dasar UX Design', deskripsi: 'Kenali proses UX dari memahami pengguna sampai menguji desain pertama Anda.', tingkat: 'Pemula', gambar: null, status: 'terbit', rating: 4.8, dibuatPada: hariLalu(120) },
      { id: 2, idKategori: 1, nama: 'Membaca Cepat dan Efektif', deskripsi: 'Teknik skimming, scanning, dan mencatat agar membaca lebih cepat tanpa kehilangan makna.', tingkat: 'Pemula', gambar: null, status: 'terbit', rating: 4.6, dibuatPada: hariLalu(100) },
      { id: 3, idKategori: 3, nama: 'JavaScript untuk Pemula', deskripsi: 'Belajar dasar pemrograman JavaScript langkah demi langkah dengan contoh sederhana.', tingkat: 'Pemula', gambar: null, status: 'terbit', rating: 4.7, dibuatPada: hariLalu(90) },
      { id: 4, idKategori: 2, nama: 'Riset Pengguna Praktis', deskripsi: 'Rencanakan riset, lakukan wawancara, dan susun insight yang bisa dipakai tim.', tingkat: 'Menengah', gambar: null, status: 'terbit', rating: 4.5, dibuatPada: hariLalu(70) },
      { id: 5, idKategori: 3, nama: 'Struktur Data Bertahap', deskripsi: 'Pahami array, linked list, stack, queue, tree, dan graph secara bertahap.', tingkat: 'Menengah', gambar: null, status: 'terbit', rating: 4.4, dibuatPada: hariLalu(60) },
      { id: 6, idKategori: 4, nama: 'Speaking Bahasa Inggris Sehari-hari', deskripsi: 'Latihan percakapan bahasa Inggris untuk situasi sehari-hari.', tingkat: 'Pemula', gambar: null, status: 'terbit', rating: 4.3, dibuatPada: hariLalu(40) },
      { id: 7, idKategori: 1, nama: 'Menulis Reflektif', deskripsi: 'Latih kebiasaan menulis reflektif untuk memahami pengalaman belajar Anda.', tingkat: 'Menengah', gambar: null, status: 'terbit', rating: 4.2, dibuatPada: hariLalu(30) },
      { id: 8, idKategori: 5, nama: 'Dasar Bisnis Digital', deskripsi: 'Pengantar model bisnis digital dan pemasaran daring.', tingkat: 'Pemula', gambar: null, status: 'draf', rating: 0, dibuatPada: hariLalu(5) },
    ],
    pelajaran,
    tagKonten: [
      { id: 1, idKelas: 1, idPelajaran: null, jenis: 'Praktik', tingkatKesulitan: 'Mudah' },
      { id: 2, idKelas: 1, idPelajaran: null, jenis: 'Terstruktur', tingkatKesulitan: 'Mudah' },
      { id: 3, idKelas: 2, idPelajaran: null, jenis: 'Terstruktur', tingkatKesulitan: 'Mudah' },
      { id: 4, idKelas: 3, idPelajaran: null, jenis: 'Praktik', tingkatKesulitan: 'Sedang' },
      { id: 5, idKelas: 4, idPelajaran: null, jenis: 'Reflektif', tingkatKesulitan: 'Sedang' },
      { id: 6, idKelas: 5, idPelajaran: null, jenis: 'Teoritis', tingkatKesulitan: 'Sulit' },
      { id: 7, idKelas: 5, idPelajaran: null, jenis: 'Terstruktur', tingkatKesulitan: 'Sulit' },
      { id: 8, idKelas: 6, idPelajaran: null, jenis: 'Praktik', tingkatKesulitan: 'Mudah' },
      { id: 9, idKelas: 7, idPelajaran: null, jenis: 'Reflektif', tingkatKesulitan: 'Sedang' },
      { id: 10, idKelas: 3, idPelajaran: 12, jenis: 'Teoritis', tingkatKesulitan: 'Sedang' },
    ],
    pengguna: [
      { id: 1, nama: 'Admin personaLearn', email: 'admin@personalearn.id', kataSandi: 'Admin123', noTelepon: '', foto: null, peran: 'admin', tipeMbti: null, poin: 0, streak: 0, onboardingSelesai: true, dibuatPada: hariLalu(200) },
      { id: 2, nama: 'Samsul Arifin', email: 'samsul@gmail.com', kataSandi: 'Samsul123', noTelepon: '081234567890', foto: null, peran: 'pelajar', tipeMbti: 'INTJ', poin: 120, streak: 3, onboardingSelesai: true, dibuatPada: hariLalu(58) },
      { id: 3, nama: 'Dewi Lestari', email: 'dewi@gmail.com', kataSandi: 'Dewi1234', noTelepon: '081298765432', foto: null, peran: 'pelajar', tipeMbti: 'ENFJ', poin: 340, streak: 9, onboardingSelesai: true, dibuatPada: hariLalu(45) },
      { id: 4, nama: 'Budi Santoso', email: 'budi@gmail.com', kataSandi: 'Budi1234', noTelepon: '081355512345', foto: null, peran: 'pelajar', tipeMbti: null, poin: 10, streak: 0, onboardingSelesai: false, dibuatPada: hariLalu(3) },
      { id: 5, nama: 'Rina Kartika', email: 'rina@gmail.com', kataSandi: 'Rina1234', noTelepon: '081377788899', foto: null, peran: 'pelajar', tipeMbti: 'ISTP', poin: 75, streak: 1, onboardingSelesai: true, dibuatPada: hariLalu(20) },
    ],
    kelasDiikuti: [
      { idPengguna: 2, idKelas: 1, progres: 40, selesai: [1, 2], pelajaranTerakhir: 2, tanggalAmbil: hariLalu(14) },
      { idPengguna: 2, idKelas: 3, progres: 75, selesai: [9, 10, 11], pelajaranTerakhir: 11, tanggalAmbil: hariLalu(30) },
      { idPengguna: 3, idKelas: 7, progres: 100, selesai: [22, 23], pelajaranTerakhir: 23, tanggalAmbil: hariLalu(25) },
      { idPengguna: 3, idKelas: 4, progres: 33, selesai: [13], pelajaranTerakhir: 13, tanggalAmbil: hariLalu(10) },
      { idPengguna: 5, idKelas: 6, progres: 33, selesai: [19], pelajaranTerakhir: 19, tanggalAmbil: hariLalu(8) },
      { idPengguna: 5, idKelas: 1, progres: 20, selesai: [1], pelajaranTerakhir: 1, tanggalAmbil: hariLalu(6) },
    ],
    favorit: [{ idPengguna: 2, idKelas: 4 }],
    tantangan: [
      {
        id: 1,
        judul: 'Tantangan Minggu Ini: Dasar UX',
        hadiahPoin: 50,
        soal: [
          { teks: 'Apa tujuan utama UX design?', opsi: ['Membuat logo', 'Merancang pengalaman pengguna yang mudah dan efektif', 'Menulis kode backend', 'Menentukan harga produk'], benar: 1 },
          { teks: 'Wireframe adalah ...', opsi: ['Desain visual final', 'Kerangka tata letak berfidelitas rendah', 'Laporan keuangan', 'Kode HTML'], benar: 1 },
          { teks: 'Metode untuk menggali kebutuhan pengguna adalah ...', opsi: ['Wawancara', 'Kompilasi', 'Deployment', 'Enkripsi'], benar: 0 },
          { teks: 'Uji kegunaan dilakukan dengan ...', opsi: ['Membaca dokumentasi', 'Mengamati pengguna menyelesaikan tugas', 'Menambah fitur baru', 'Mengganti warna'], benar: 1 },
          { teks: 'Hasil uji kegunaan dipakai untuk ...', opsi: ['Dihapus', 'Iterasi desain', 'Mengganti nama produk', 'Tidak dipakai'], benar: 1 },
        ],
      },
    ],
    tantanganPengguna: [],
    notifikasi: [
      { id: 1, idPengguna: 2, judul: 'Waktunya belajar!', pesan: 'Lanjutkan kelas Dasar UX Design. Tinggal 3 pelajaran lagi.', jenis: 'Pengingat belajar', tautan: '/belajar/1', waktu: hariLalu(0), sudahDibaca: false },
      { id: 2, idPengguna: 2, judul: 'Tantangan baru tersedia', pesan: 'Kerjakan Tantangan Minggu Ini dan dapatkan 50 poin.', jenis: 'Tantangan mingguan', tautan: '/tantangan', waktu: hariLalu(1), sudahDibaca: false },
      { id: 3, idPengguna: 2, judul: 'Rekomendasi kelas untukmu', pesan: 'Struktur Data Bertahap cocok untuk kelompok Analitis.', jenis: 'Rekomendasi AI', tautan: '/rekomendasi', waktu: hariLalu(3), sudahDibaca: true },
    ],
    pengaturanNotifikasi: [
      { idPengguna: 2, aktif: true, jenis: ['Pengingat belajar', 'Tantangan mingguan', 'Rekomendasi AI'], waktuPengingat: '19:00', frekuensi: 'Harian' },
    ],
    riwayatObrolan: [],
    riwayatBelajar: [
      ...[13, 12, 10, 9, 7, 5, 4, 2, 1, 0].map((n, i) => ({ idPengguna: 2, tanggal: hariLalu(n), menit: [20, 35, 15, 40, 25, 30, 10, 45, 20, 15][i], materiSelesai: [1, 1, 0, 2, 1, 1, 0, 2, 1, 1][i] })),
      ...[6, 4, 3, 1].map((n, i) => ({ idPengguna: 3, tanggal: hariLalu(n), menit: [30, 25, 40, 20][i], materiSelesai: 1 })),
    ],
    penilaianVideo: [],
  }
}
