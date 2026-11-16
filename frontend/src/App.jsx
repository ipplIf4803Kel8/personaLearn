import { AuthProvider } from '@/context/AuthContext'
import { RouterProvider } from '@/lib/router'
import { ToastProvider } from '@/components/pelajar/Toast'
import { AppRoutes } from '@/routes/AppRoutes'
import { ScrollToTop } from '@/routes/ScrollToTop'

/**
 * Akar aplikasi. Urutan pembungkus:
 * - RouterProvider : alamat halaman (#/beranda, #/kelas/3, ...)
 * - AuthProvider   : login lewat backend (token, /api/auth/...)
 * - ToastProvider  : pesan singkat "berhasil disimpan", dll.
 * Daftar halaman ada di routes/AppRoutes.jsx.
 */
function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </RouterProvider>
  )
}

export default App
