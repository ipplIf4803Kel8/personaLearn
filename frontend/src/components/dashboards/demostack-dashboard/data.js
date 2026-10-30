import {
  BarChart3,
  Bell,
  BookOpen,
  LayoutDashboard,
  Tags,
  Trophy,
  Users,
} from 'lucide-react'

const adminNavigation = [
  { name: 'Ringkasan', href: '/admin', icon: LayoutDashboard },
  { name: 'Kategori', href: '/admin/categories', icon: Tags },
  { name: 'Kelas', href: '/admin/classes', icon: BookOpen },
  { name: 'Tantangan', href: '/admin/challenges', icon: Trophy },
  { name: 'Pelajar', href: '/admin/students', icon: Users },
  { name: 'Notifikasi', href: '/admin/notifications', icon: Bell },
  { name: 'Laporan', href: '/admin/reports', icon: BarChart3 },
]

export { adminNavigation }
