import DashboardLayout from './dashboard-layout'
import { CategoriesContent } from './components/demostack/categories-content'
import { ChallengesContent } from './components/demostack/challenges-content'
import { ClassesContent } from './components/demostack/classes-content'
import { DashboardContent } from './components/demostack/dashboard-content'
import { NotificationsContent } from './components/demostack/notifications-content'
import { ReportsContent } from './components/demostack/reports-content'
import { StudentsContent } from './components/demostack/students-content'
import { DashboardNavigationProvider, useDashboardNavigation } from './components/demostack/navigation'
import { ThemeProvider } from './components/demostack/theme-provider'

function DashboardRoute() {
  const { pathname } = useDashboardNavigation()

  if (pathname === '/admin/categories') return <DashboardLayout><CategoriesContent /></DashboardLayout>
  if (pathname.startsWith('/admin/classes')) return <DashboardLayout><ClassesContent /></DashboardLayout>
  if (pathname === '/admin/challenges') return <DashboardLayout><ChallengesContent /></DashboardLayout>
  if (pathname === '/admin/students') return <DashboardLayout><StudentsContent /></DashboardLayout>
  if (pathname === '/admin/notifications') return <DashboardLayout><NotificationsContent /></DashboardLayout>
  if (pathname === '/admin/reports') return <DashboardLayout><ReportsContent /></DashboardLayout>
  return <DashboardLayout><DashboardContent /></DashboardLayout>
}

function DemostackDashboardDemo() {
  return (
    <ThemeProvider>
      <DashboardNavigationProvider initialPathname="/admin">
        <DashboardRoute />
      </DashboardNavigationProvider>
    </ThemeProvider>
  )
}

export default DemostackDashboardDemo
