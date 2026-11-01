import { DbProvider } from '@/data/db'
import { RouterProvider } from '@/lib/router'
import { ToastProvider } from '@/components/pelajar/Toast'
import { AppRoutes } from '@/routes/AppRoutes'
import { ScrollToTop } from '@/routes/ScrollToTop'
import { DevPanel } from '@/dev/DevPanel'

/**
 * Akar aplikasi. Urutan pembungkus:
 * - RouterProvider : alamat halaman (#/beranda, #/kelas/3, ...)
 * - DbProvider     : data aplikasi (akun, kelas, progres, ...)
 * - ToastProvider  : pesan singkat "berhasil disimpan", dll.
 * Daftar halaman ada di routes/AppRoutes.jsx.
 */
function App() {
  return (
    <RouterProvider>
      <DbProvider>
        <ToastProvider>
          <ScrollToTop />
          <AppRoutes />
          {import.meta.env.DEV && <DevPanel />}
        </ToastProvider>
      </DbProvider>
    </RouterProvider>
  )
}

export default App
