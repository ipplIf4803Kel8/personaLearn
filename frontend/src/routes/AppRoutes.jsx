import { Route, Routes } from 'react-router'
import { AdminOnly, StudentOnly, GuestOnly, AdminGuestOnly } from '@/routes/RouteGuards'
import { NotFoundPage } from '@/pages/NotFoundPage'

// ---- Pelajar: UC1 Autentikasi
import { SplashPage } from '@/pages/pelajar/autentikasi/SplashPage'
import { MasukPage } from '@/pages/pelajar/autentikasi/MasukPage'
import { DaftarPage } from '@/pages/pelajar/autentikasi/DaftarPage'
import { DaftarBerhasilPage } from '@/pages/pelajar/autentikasi/DaftarBerhasilPage'
import { LupaSandiPage } from '@/pages/pelajar/autentikasi/LupaSandiPage'
import { CekEmailPage } from '@/pages/pelajar/autentikasi/CekEmailPage'
import { AturUlangPage } from '@/pages/pelajar/autentikasi/AturUlangPage'
import { AturUlangBerhasilPage } from '@/pages/pelajar/autentikasi/AturUlangBerhasilPage'
import { OtorisasiPage } from '@/pages/pelajar/autentikasi/OtorisasiPage'
import { KenaliGayaBelajarPage } from '@/pages/pelajar/autentikasi/KenaliGayaBelajarPage'
// ---- Pelajar: UC2 Eksplorasi Kelas
import { BerandaPage } from '@/pages/pelajar/eksplorasi/BerandaPage'
import { CariKelasPage } from '@/pages/pelajar/eksplorasi/CariKelasPage'
import { GambaranKelasPage } from '@/pages/pelajar/eksplorasi/GambaranKelasPage'
import { AmbilKelasBerhasilPage } from '@/pages/pelajar/eksplorasi/AmbilKelasBerhasilPage'
import { PelajaranPopulerPage } from '@/pages/pelajar/eksplorasi/PelajaranPopulerPage'
import { KelasFavoritPage } from '@/pages/pelajar/eksplorasi/KelasFavoritPage'
// ---- Pelajar: UC3 Pemantauan Kemajuan
import { DaftarKelasAndaPage } from '@/pages/pelajar/kemajuan/DaftarKelasAndaPage'
import { SemuaKelasPage } from '@/pages/pelajar/kemajuan/SemuaKelasPage'
import { LanjutBelajarPage } from '@/pages/pelajar/kemajuan/LanjutBelajarPage'
import { StatistikBelajarPage } from '@/pages/pelajar/kemajuan/StatistikBelajarPage'
import { DetailTantanganPage } from '@/pages/pelajar/kemajuan/DetailTantanganPage'
import { SoalTantanganPage } from '@/pages/pelajar/kemajuan/SoalTantanganPage'
import { TantanganSelesaiPage } from '@/pages/pelajar/kemajuan/TantanganSelesaiPage'
// ---- Pelajar: UC4 Profil
import { ProfilPage } from '@/pages/pelajar/profil/ProfilPage'
import { UbahProfilPage } from '@/pages/pelajar/profil/UbahProfilPage'
import { UbahProfilBerhasilPage } from '@/pages/pelajar/profil/UbahProfilBerhasilPage'
import { UbahKataSandiPage } from '@/pages/pelajar/profil/UbahKataSandiPage'
import { UbahKataSandiBerhasilPage } from '@/pages/pelajar/profil/UbahKataSandiBerhasilPage'
// ---- Pelajar: UC5 Notifikasi
import { NotifikasiPage } from '@/pages/pelajar/notifikasi/NotifikasiPage'
import { DetailNotifikasiPage } from '@/pages/pelajar/notifikasi/DetailNotifikasiPage'
import { PengaturanNotifikasiPage } from '@/pages/pelajar/notifikasi/PengaturanNotifikasiPage'
import { PengaturanNotifikasiBerhasilPage } from '@/pages/pelajar/notifikasi/PengaturanNotifikasiBerhasilPage'
// ---- Pelajar: UC6 Rekomendasi & Bantuan AI
import { RekomendasiPage } from '@/pages/pelajar/ai/RekomendasiPage'
import { VideoPembelajaranPage } from '@/pages/pelajar/ai/VideoPembelajaranPage'
import { ObrolanSinauBotPage } from '@/pages/pelajar/ai/ObrolanSinauBotPage'
import { SesiOneToOnePage } from '@/pages/pelajar/ai/SesiOneToOnePage'
// ---- Admin
import { AdminLayout } from '@/components/admin/AdminLayout'
import { MasukAdminPage } from '@/pages/admin/MasukAdminPage'
import { DashboardAdminPage } from '@/pages/admin/DashboardAdminPage'
import { KategoriPage } from '@/pages/admin/KategoriPage'
import { KelasPage } from '@/pages/admin/KelasPage'
import { DetailKelasPage } from '@/pages/admin/DetailKelasPage'
import { TagKontenPage } from '@/pages/admin/TagKontenPage'
import { DataPelajarPage } from '@/pages/admin/DataPelajarPage'
import { AdminChallengesPage } from '@/pages/admin/AdminChallengesPage'
import { AdminNotificationsPage } from '@/pages/admin/AdminNotificationsPage'
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage'

/**
 * Daftar semua alamat halaman. ":id" = bagian alamat yang berubah (mis. /kelas/3), dibaca di halaman dengan useParams().
 * Kode di komentar = kode layar di DPPL.
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Publik: hanya untuk yang belum login */}
      <Route element={<GuestOnly />}>
        <Route path="/" element={<SplashPage />} /> {/* UC1-L01 */}
        <Route path="/masuk" element={<MasukPage />} /> {/* UC1-L02 */}
        <Route path="/daftar" element={<DaftarPage />} /> {/* UC1-L03 */}
        <Route path="/daftar/berhasil" element={<DaftarBerhasilPage />} /> {/* UC1-L04 */}
        <Route path="/lupa-sandi" element={<LupaSandiPage />} /> {/* UC1-L05 */}
        <Route path="/cek-email" element={<CekEmailPage />} /> {/* UC1-L06 */}
        <Route path="/atur-ulang" element={<AturUlangPage />} /> {/* UC1-L07 */}
        <Route path="/atur-ulang/berhasil" element={<AturUlangBerhasilPage />} /> {/* UC1-L08 */}
        <Route path="/otorisasi/:penyedia" element={<OtorisasiPage />} /> {/* UC1-L11 */}
      </Route>

      {/* Pelajar: wajib login */}
      <Route element={<StudentOnly />}>
        <Route path="/kenali-gaya-belajar" element={<KenaliGayaBelajarPage />} /> {/* UC1-L12 */}

        <Route path="/beranda" element={<BerandaPage />} /> {/* UC2-L01 */}
        <Route path="/cari" element={<CariKelasPage />} /> {/* UC2-L02, L03 */}
        <Route path="/kelas/:id" element={<GambaranKelasPage />} /> {/* UC2-L04 */}
        <Route path="/kelas/:id/berhasil" element={<AmbilKelasBerhasilPage />} /> {/* UC2-L05 */}
        <Route path="/populer" element={<PelajaranPopulerPage />} /> {/* UC2-L06 */}
        <Route path="/favorit" element={<KelasFavoritPage />} /> {/* UC2-L07 */}

        <Route path="/kelas-anda" element={<DaftarKelasAndaPage />} /> {/* UC3-L01 */}
        <Route path="/belajar/:id" element={<LanjutBelajarPage />} /> {/* UC3-L02, L03, L07 */}
        <Route path="/kelas-anda/semua" element={<SemuaKelasPage />} /> {/* UC3-L04 */}
        <Route path="/statistik" element={<StatistikBelajarPage />} /> {/* UC3-L05 */}
        <Route path="/tantangan" element={<DetailTantanganPage />} /> {/* UC3-L06 */}
        <Route path="/tantangan/soal" element={<SoalTantanganPage />} /> {/* UC3-L08 */}
        <Route path="/tantangan/selesai" element={<TantanganSelesaiPage />} /> {/* UC3-L09 */}

        <Route path="/profil" element={<ProfilPage />} /> {/* UC4-L01, L06 */}
        <Route path="/profil/ubah" element={<UbahProfilPage />} /> {/* UC4-L02, L07 */}
        <Route path="/profil/ubah/berhasil" element={<UbahProfilBerhasilPage />} /> {/* UC4-L03 */}
        <Route path="/profil/kata-sandi" element={<UbahKataSandiPage />} /> {/* UC4-L04 */}
        <Route path="/profil/kata-sandi/berhasil" element={<UbahKataSandiBerhasilPage />} /> {/* UC4-L05 */}

        <Route path="/notifikasi" element={<NotifikasiPage />} /> {/* UC5-L01 */}
        <Route path="/notifikasi/pengaturan" element={<PengaturanNotifikasiPage />} /> {/* UC5-L02 */}
        <Route path="/notifikasi/pengaturan/berhasil" element={<PengaturanNotifikasiBerhasilPage />} /> {/* UC5-L03 */}
        <Route path="/notifikasi/:id" element={<DetailNotifikasiPage />} /> {/* UC5-L04 */}

        <Route path="/rekomendasi" element={<RekomendasiPage />} /> {/* UC6-L01 */}
        <Route path="/video/:id" element={<VideoPembelajaranPage />} /> {/* UC6-L02 */}
        <Route path="/obrolan/:id" element={<ObrolanSinauBotPage />} /> {/* UC6-L03, L04 */}
        <Route path="/one-to-one/:id" element={<SesiOneToOnePage />} /> {/* UC6-L05 */}
      </Route>

      {/* Admin */}
      <Route element={<AdminGuestOnly />}>
        <Route path="/admin/masuk" element={<MasukAdminPage />} /> {/* UC1-L09 */}
      </Route>
      <Route element={<AdminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardAdminPage />} /> {/* UC1-L10 */}
          <Route path="kategori" element={<KategoriPage />} /> {/* UC7 */}
          <Route path="kelas" element={<KelasPage />} /> {/* UC8 */}
          <Route path="kelas/:id" element={<DetailKelasPage />} /> {/* UC9 */}
          <Route path="tag" element={<TagKontenPage />} /> {/* UC10 */}
          <Route path="pelajar" element={<DataPelajarPage />} /> {/* UC11 */}
          <Route path="tantangan" element={<AdminChallengesPage />} />
          <Route path="notifikasi" element={<AdminNotificationsPage />} />
          <Route path="laporan" element={<AdminReportsPage />} />
        </Route>
      </Route>

      {/* Alamat lain: 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
