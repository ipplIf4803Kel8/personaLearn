# personaLearn
 
Platform *e-learning* dengan rekomendasi konten pembelajaran yang dipersonalisasi berdasarkan kepribadian dan gaya belajar pelajar (MBTI, Big Five Personality Traits, VARK), dilengkapi bantuan belajar berbasis AI.
 
> Tugas Besar mata kuliah **Implementasi dan Pengujian Perangkat Lunak (CAK3BAB3)** — Kelompok 8, kelas BS1IF-48-PJJ-03, S1 Informatika, Telkom University.
> Proyek ini melanjutkan hasil analisis dan perancangan (SKPL & DPPL) dari mata kuliah APPL.
 
---
 
## Fitur Utama
 
| No | Fitur | Deskripsi |
|----|-------|-----------|
| 1 | Registrasi Pengguna | Daftar akun baru, login, dan lupa kata sandi |
| 2 | Eksplorasi Kelas | Mencari, memfilter, dan melihat detail kelas |
| 3 | Kemajuan Pembelajaran | Memantau dan melanjutkan progres belajar |
| 4 | Manajemen Profil | Mengubah data profil dan preferensi belajar (MBTI/VARK) |
| 5 | Pengaturan Notifikasi | Mengatur jenis, waktu, dan frekuensi pengingat belajar |
| 6 | Rekomendasi & Bantuan AI | Rekomendasi materi yang personal dan tanya jawab dengan AI saat belajar |
 
## Tech Stack
 
| Bagian | Teknologi |
|--------|-----------|
| Bahasa | JavaScript (Node.js) |
| Backend | Node.js — *framework: [Express / NestJS]* |
| Frontend | React + Vite, Tailwind CSS |
| Database | PostgreSQL |
| Desain UI/UX | Figma |
| Version Control | Git & GitHub |
 
## Struktur Repository
 
```
personaLearn/
├── backend/        # REST API (Node.js)
├── frontend/       # Aplikasi web (React + Tailwind CSS)
├── docs/           # Dokumen tugas & laporan progres
│   ├── tugas01/
│   ├── tugas02/
│   └── ...
└── README.md
```
 
## Menjalankan Proyek
 
> Prasyarat: Node.js (LTS), npm, dan PostgreSQL sudah terpasang.
 
```bash
# 1. Clone repository
git clone https://github.com/ipplIf4803Kel8/personaLearn.git
cd personaLearn
 
# 2. Backend
cd backend
cp .env.example .env      # isi konfigurasi database
npm install
npm run dev
 
# 3. Frontend (terminal baru)
cd frontend
npm install
npm run dev
```
 
## Alur Kerja Git
 
- `main` — versi stabil
- `dev` — integrasi fitur
- `feature/<nama-fitur>` — pengerjaan fitur, digabung ke `dev` melalui *pull request*
 
---
 
<sub>Program Studi S1 Informatika PJJ — Fakultas Informatika — Telkom University, 2025/2026</sub>
 
