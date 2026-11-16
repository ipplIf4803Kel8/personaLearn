# personaLearn

Aplikasi e-learning yang merekomendasikan kelas sesuai kepribadian (MBTI) dan gaya belajar (VARK) pelajar, ditambah asisten belajar bernama Sinau Bot.

Tugas Besar Implementasi dan Pengujian Perangkat Lunak (CAK3BAB3), Kelompok 8, kelas BS1IF-48-PJJ-03, Telkom University. Lanjutan dari TUBES APPL (SKPL dan DPPL).

## Fitur

Pelajar:
- Daftar, masuk, lupa kata sandi lewat kode OTP (berlaku 10 menit, maksimal 5 percobaan), dan atur ulang kata sandi.
- Isi preferensi belajar: tipe MBTI dan gaya belajar VARK.
- Cari dan filter kelas (kata kunci, kategori, level, rating, durasi, favorit), kelas populer, dan rekomendasi kelas.
- Detail kelas, pratinjau pelajaran pertama tanpa mengambil kelas, ambil kelas, beri rating, dan simpan favorit.
- Belajar: daftar kelas yang diambil dengan persentase progres, tandai pelajaran selesai, like atau dislike pelajaran.
- Poin (10 per pelajaran), streak harian, dan tantangan mingguan.
- Notifikasi (daftar, tandai dibaca) dan pengaturan notifikasi.
- Pengingat belajar otomatis: tiap menit server memeriksa pelajar yang jam pengingatnya tiba, lalu mengirim notifikasi (harian, atau mingguan tiap Senin). Dilewati bila sudah belajar hari itu, dan maksimal sekali sehari. Berjalan dalam satu proses tanpa antrean.
- Profil: ubah data, ganti kata sandi, unggah dan hapus foto profil (jpg, png, webp, maksimal 2 MB).
- Sinau Bot: tanya jawab saat belajar, jawabannya disesuaikan dengan gaya belajar dan pelajaran yang sedang dibuka.

Admin:
- Kelola kategori, kelas (termasuk tag VARK dan kepribadian), pelajaran (termasuk urutan), dan tantangan.
- Lihat data pelajar, detail pelajar (profil, preferensi, kelas dan progres), serta aktifkan atau nonaktifkan akun.
- Kirim notifikasi ke semua pelajar atau satu pelajar.
- Ringkasan statistik dan laporan (progres rata-rata per kelas, rating tertinggi dan terendah, jumlah pesan Sinau Bot).

## Teknologi

- Backend: Node.js, Express 5, PostgreSQL (`pg`, SQL mentah tanpa ORM), bcrypt, jsonwebtoken, zod, multer, nodemailer
- Frontend: React, Vite, Tailwind CSS, Watermelon UI
- Test: vitest dan supertest
- Sinau Bot memakai Google Gemini (REST generateContent)

## Struktur Folder

```
backend/
  db/migrations/   skema SQL bernomor
  db/seeds/        data contoh (admin, pelajar, kategori, kelas, tantangan)
  db/queries.sql   contoh query SELECT untuk laporan basis data
  scripts/         migrate.js
  src/
    routes/        definisi endpoint (admin ada di routes/admin)
    controllers/   terima request, panggil service, kirim respons
    services/      logika bisnis berupa class
    models/        class entitas dan akses database
    middlewares/   auth, validate, upload, errorHandler
    validators/    skema zod per endpoint
    utils/         helper kecil (keamanan, email, error)
  test/            unit dan integration test
frontend/          tampilan web (React)
docs/              dokumen tugas
```

## Arsitektur

Setiap request mengalir satu arah:

```
route -> middleware (requireAuth, validate) -> controller -> service -> model -> PostgreSQL
```

- Route hanya mendaftarkan endpoint dan middleware.
- Controller mengambil input yang sudah divalidasi, memanggil service, lalu membentuk respons.
- Service berisi aturan bisnis (rekomendasi, progres, poin, streak, notifikasi, chat).
- Model adalah class entitas (field privat, getter dan setter) beserta query berparameter.

Respons sukses pelajar berbentuk `{ data, message }` (daftar memakai `meta: { page, limit, total }`). Respons gagal berbentuk `{ message, errors }`. Endpoint admin mengembalikan payload apa adanya (array atau objek), dan galat tetap `{ message, errors }`. Status yang dipakai: 400, 401, 403, 404, 409, 422, 429, 500.

## Cara Menjalankan

Butuh Node.js 20 ke atas dan PostgreSQL.

```bash
cp backend/.env.example backend/.env   # sesuaikan DB_USER, DB_PASSWORD, JWT_SECRET
npm run setup                          # pasang dependensi root, backend, dan frontend
npm run db:migrate                     # buat database dan jalankan migrasi
npm run db:seed                        # isi data contoh (aman dijalankan berulang)
npm run dev                            # backend :3000 dan frontend :5173
```

Mode build: `npm run start`. Backend atau frontend saja: `npm run dev` di foldernya masing-masing.

### Variabel `.env` (backend)

| Variabel | Keterangan |
|---|---|
| `PORT` | port API, bawaan 3000 |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | koneksi PostgreSQL |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | penandatangan token, wajib diisi |
| `CORS_ORIGIN` | origin frontend yang boleh memanggil API, dipisah koma (mis. `http://localhost:5174,https://app.example.com`); kosong berarti semua origin diizinkan (dev) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | akun admin yang dibuat oleh seed |
| `UPLOAD_DIR` | folder foto profil, bawaan `uploads` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | pengiriman OTP; bila `SMTP_HOST` kosong, kode dicetak ke console |
| `REMINDER_ENABLED` | `false` mematikan pengingat belajar otomatis, bawaan aktif |
| `REMINDER_TZ` | zona waktu jam pengingat, bawaan `Asia/Jakarta` |
| `AI_API_KEY`, `AI_MODEL` | Sinau Bot (Gemini); kunci dari Google AI Studio, model bawaan `gemini-3.1-flash-lite`; bila kunci kosong, bot membalas pesan cadangan |
| `CHAT_DAILY_LIMIT` | batas pesan Sinau Bot per pengguna per hari, bawaan 100 |

### Akun seed

| Peran | Email | Kata sandi |
|---|---|---|
| Admin | nilai `ADMIN_EMAIL` | nilai `ADMIN_PASSWORD` |
| Pelajar | `student@personalearn.id` | `student123` |

## Test

```bash
npm test --prefix backend
```

Perintah ini memakai database `personalearn_test` (dibuat dan dimigrasi otomatis) dan menjalankan semua file test berurutan, karena beberapa test mengosongkan tabel. Sinau Bot di-mock, jadi test tidak memanggil API sungguhan. Jangan arahkan `DB_NAME` ke database utama.

## Endpoint

Semua berawalan `/api`. Selain `/health` dan `/auth/register|login|forgot-password|reset-password`, semua endpoint butuh header `Authorization: Bearer <token>`.

Auth dan akun:
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `POST /auth/forgot-password`, `POST /auth/reset-password`
- `GET|PUT /me/preferences`, `GET|PUT /me/profile`, `PUT /me/password`
- `POST|DELETE /me/avatar`
- `GET|PUT /me/notification-settings`

Katalog:
- `GET /categories`, `GET /courses` (`search, category, level, minRating, sort, page, limit`)
- `GET /courses/popular`, `GET /courses/recommended`, `GET /courses/:id`
- `GET /courses/:id/preview`
- `POST /courses/:id/enroll`, `POST /courses/:id/rating`, `POST|DELETE /courses/:id/favorite`

Belajar:
- `GET /me/stats`, `GET /me/enrollments`, `GET /me/enrollments/:courseId`
- `GET /lessons/:id`, `POST /lessons/:id/complete`, `PUT /lessons/:id/reaction`
- `GET /challenges/active`, `POST /challenges/:id/complete`

Notifikasi dan Sinau Bot:
- `GET /notifications`, `GET /notifications/:id`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- `GET|POST /chat/messages`

Sinau Bot: balasan disesuaikan dengan gaya belajar VARK, MBTI, dan pelajaran yang dibuka. Pengamanan: semua teks pengguna dan isi database dibungkus pembatas sebagai data tidak tepercaya, input dibersihkan, upaya jelas membocorkan prompt atau jailbreak ditolak tanpa memanggil LLM, balasan disaring (HTML, kunci, kontak, potongan prompt), hanya data minimal yang dikirim ke LLM (tanpa email, telepon, atau id), serta dibatasi 10 pesan per menit, `CHAT_DAILY_LIMIT` per hari, dan satu permintaan serentak per pengguna.

Admin (role admin):
- `GET|POST /admin/categories`, `PATCH|DELETE /admin/categories/:id`
- `GET|POST /admin/courses`, `PATCH|DELETE /admin/courses/:id`
- `GET|POST /admin/courses/:id/lessons`, `PATCH /admin/courses/:id/lessons/reorder`, `PATCH|DELETE /admin/lessons/:id`
- `GET|POST /admin/challenges`, `PATCH|DELETE /admin/challenges/:id`
- `GET /admin/students`, `GET /admin/students/:id`, `PATCH /admin/students/:id/status`
- `GET|POST /admin/notifications`, `DELETE /admin/notifications/:id`
- `GET /admin/stats`, `GET /admin/reports` (`from`, `to`)

## Anggota

- Ilma Nurul Qalbi (ilmakartadinata)
- Adam Ibnu Alfatah (Adamibnualfatahh)

Dosen: Amarilis Putri Yanuarifiani, Ph.D
