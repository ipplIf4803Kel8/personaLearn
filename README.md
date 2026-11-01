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

### 1. Setup Awal (Sekali Saja)

```bash
# Setup backend .env
cp backend/.env.example backend/.env
# (Sesuaikan DB_USER dan DB_PASSWORD di backend/.env jika diperlukan)

# Install semua dependensi (root, backend, frontend)
npm run setup

# Migrasi database PostgreSQL
npm run db:migrate
```

### 2. Menjalankan Sekaligus dari Root Folder

- **Mode Build (Production Preview):**
  ```bash
  npm run start
  # atau
  npm run start:prod
  ```
  *(Otomatis mem-build frontend dan menjalankan backend di http://localhost:3000 serta frontend preview di http://localhost:4173)*

- **Mode Development (Hot-reload):**
  ```bash
  npm run dev
  ```
  *(Menjalankan backend di http://localhost:3000 dan frontend di http://localhost:5173 secara bersamaan)*

### Menjalankan Terpisah Secara Manual

Backend:
```bash
cd backend
npm run dev # atau npm start
```

Frontend:
```bash
cd frontend
npm run dev # atau npm run build && npm run preview
```

## Anggota

- Ilma Nurul Qalbi (ilmakartadinata)
- Adam Ibnu Alfatah (Adamibnualfatahh)

Dosen: Amarilis Putri Yanuarifiani, Ph.D
