import { Outlet } from 'react-router'
import { useEffect } from 'react'
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { AdminTopbar } from '@/components/admin/Topbar'
import { ThemeProvider } from '@/components/admin/ThemeProvider'
import { AdminSearchProvider } from '@/components/admin/AdminNavigation'
import '@/components/admin/admin.css'

const COLLAPSE_BELOW = 1100

// Sidebar menciut jadi ikon di bawah 1100px dan terbuka lagi di atasnya; tombol manual tetap bisa dipakai di antaranya.
function AutoCollapse() {
  const { setOpen } = useSidebar()
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${COLLAPSE_BELOW}px)`)
    const sync = () => setOpen(mql.matches)
    sync()
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

// Kerangka semua halaman admin: sidebar kiri, topbar, lalu isi halaman (<Outlet />) sesuai alamat.
export function AdminLayout() {
  return (
    <ThemeProvider>
      <AdminSearchProvider>
      <SidebarProvider
        defaultOpen={window.innerWidth >= COLLAPSE_BELOW}
        className="demostack-dashboard no-scrollbar h-svh gap-6 overflow-hidden"
        style={{ '--sidebar-width': '16.25rem', '--sidebar-width-icon': '5.125rem' }}
      >
        <AutoCollapse />
        <AdminSidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden md:p-1.5 md:pl-0">
          <div className="sticky top-0 z-50 w-full shrink-0 bg-background">
            <AdminTopbar />
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="min-h-full border-x border-b md:rounded-b-2xl">
              <Outlet />
            </div>
          </div>
        </main>
      </SidebarProvider>
      </AdminSearchProvider>
    </ThemeProvider>
  )
}
