import { useMemo } from 'react'
import { HashRouter, useLocation, useNavigate } from 'react-router'

// Navigasi aplikasi memakai React Router (HashRouter: alamat seperti #/beranda, #/kelas/3).
// File ini membungkus React Router supaya semua halaman cukup memakai satu hook: useRouter().

export function RouterProvider({ children }) {
  return <HashRouter>{children}</HashRouter>
}

/**
 * useRouter() mengembalikan:
 * - path     : alamat halaman sekarang, mis. '/kelas/3'
 * - query    : isi setelah tanda '?', mis. { filter: '1' }
 * - navigate : pindah halaman, mis. navigate('/profil') atau navigate('/beranda', { replace: true })
 * - back     : kembali ke halaman sebelumnya (atau ke fallback kalau tidak ada riwayat)
 */
export function useRouter() {
  const location = useLocation()
  const nav = useNavigate()
  return useMemo(
    () => ({
      path: location.pathname,
      query: Object.fromEntries(new URLSearchParams(location.search)),
      navigate: (to, { replace = false } = {}) => nav(to, { replace }),
      back: (fallback = '/beranda') => (window.history.length > 1 ? nav(-1) : nav(fallback, { replace: true })),
    }),
    [location.pathname, location.search, nav],
  )
}
