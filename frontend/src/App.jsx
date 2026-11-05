import { DbProvider } from '@/data/db'
import { AuthProvider } from '@/context/AuthContext'
import { RouterProvider } from '@/lib/router'
import { ToastProvider } from '@/components/pelajar/Toast'
import { AppRoutes } from '@/routes/AppRoutes'
import { ScrollToTop } from '@/routes/ScrollToTop'
import { DevPanel } from '@/dev/DevPanel'

/**
 * Akar aplikasi. Urutan pembungkus:
 * - RouterProvider : alamat halaman (#/beranda, #/kelas/3, ...)
 * - AuthProvider   : login admin lewat backend (token, /api/auth/...)
 * - DbProvider     : data pelajar sementara (dummy di localStorage, nanti diganti backend)
 * - ToastProvider  : pesan singkat "berhasil disimpan", dll.
 * Daftar halaman ada di routes/AppRoutes.jsx.
 */
function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <DbProvider>
          <ToastProvider>
            <ScrollToTop />
            <AppRoutes />
            {import.meta.env.DEV && <DevPanel />}
          </ToastProvider>
        </DbProvider>
      </AuthProvider>
    </RouterProvider>
  )
}

export default App
