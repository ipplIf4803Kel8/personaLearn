import { Outlet } from 'react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { AdminTopbar } from '@/components/admin/Topbar'
import { ThemeProvider } from '@/components/admin/ThemeProvider'
import { AdminSearchProvider } from '@/components/admin/AdminNavigation'
import '@/components/admin/admin.css'

// Kerangka semua halaman admin: sidebar kiri, topbar, lalu isi halaman (<Outlet />) sesuai alamat.
export function AdminLayout() {
  return (
    <ThemeProvider>
      <AdminSearchProvider>
      <SidebarProvider
        className="demostack-dashboard no-scrollbar h-svh gap-6 overflow-hidden"
        style={{ '--sidebar-width': '16.25rem', '--sidebar-width-icon': '5.125rem' }}
      >
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
