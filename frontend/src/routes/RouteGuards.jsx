import { Fragment } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { penggunaAktif, useDb } from '@/data/db'
import { getHomePath } from '@/routes/getHomePath'
import { useAuth } from '@/context/AuthContext'

// Penjaga rute: memutuskan halaman boleh dibuka, atau pengguna diarahkan ke halaman lain.
// <Outlet /> = tempat halaman anak (yang dijaga) ditampilkan.

// Sesi pelajar dari data dummy. Sesi admin di data dummy diabaikan: admin sekarang login lewat backend (useAuth).
// (Tanpa ini, sesi admin lama di localStorage membuat halaman saling melempar tanpa henti.)
function pelajarAktif(db) {
  const u = penggunaAktif(db)
  return u?.peran === 'pelajar' ? u : null
}

/** Halaman publik (Splash, Masuk, Daftar, ...): hanya untuk yang belum login. */
export function GuestOnly() {
  const { db } = useDb()
  const { user } = useAuth()
  const pelajar = pelajarAktif(db)
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  if (pelajar) return <Navigate to={getHomePath(pelajar)} replace />
  return <Outlet />
}

/** Halaman pelajar: wajib login sebagai pelajar; pelajar baru wajib memilih MBTI dulu (UC1-L12). */
export function StudentOnly() {
  const { db } = useDb()
  const { user } = useAuth()
  const { pathname } = useLocation()
  const u = pelajarAktif(db)
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  if (!u) return <Navigate to="/masuk" replace />
  if (!u.onboardingSelesai && pathname !== '/kenali-gaya-belajar') return <Navigate to="/kenali-gaya-belajar" replace />
  // key = alamat: halaman dimulai ulang saat pindah, mis. dari /video/1 ke /video/2
  return (
    <Fragment key={pathname}>
      <Outlet />
    </Fragment>
  )
}

/** Halaman admin: wajib login sebagai admin (login lewat backend, lihat context/AuthContext). */
export function AdminOnly() {
  const { user, loading } = useAuth()
  if (loading) return null // sedang mengecek token ke /api/auth/me
  if (user?.role !== 'admin') return <Navigate to="/masuk" replace />
  return <Outlet />
}

/** Halaman Masuk Admin (sedang tidak dipakai): admin yang sudah login langsung ke dashboard. */
export function AdminGuestOnly() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  return <Outlet />
}
