# personaLearn

Aplikasi e-learning dengan rekomendasi konten pembelajaran berdasarkan kepribadian dan gaya belajar (MBTI, Big Five, VARK), serta fitur bantuan belajar dengan AI.

Tugas Besar Implementasi dan Pengujian Perangkat Lunak (CAK3BAB3), Kelompok 8, kelas BS1IF-48-PJJ-03, Telkom University. Lanjutan dari TUBES APPL (SKPL dan DPPL).

## Fitur

1. Registrasi dan login pengguna
2. Eksplorasi kelas
3. Kemajuan pembelajaran
4. Manajemen profil pengguna
5. Pengaturan notifikasi
6. Rekomendasi konten dan bantuan pembelajaran AI

## Teknologi

- Backend: Node.js, Express
- Frontend: React, Vite, Tailwind CSS, Watermelon UI
- Database: PostgreSQL

## Struktur Folder

```
backend/    API (Express)
frontend/   Tampilan web (React)
docs/       Dokumen tugas
```

## Cara Menjalankan

Pastikan sudah terpasang Node.js 20 ke atas dan PostgreSQL.

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend berjalan di http://localhost:3000 dan frontend di http://localhost:5173.

## Anggota

- Ilma Nurul Qalbi (ilmakartadinata)
- Adam Ibnu Alfatah (Adamibnualfatahh)

Dosen: Amarilis Putri Yanuarifiani, Ph.D
