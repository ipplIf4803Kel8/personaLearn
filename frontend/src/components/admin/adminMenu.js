import { BarChart3, Bell, BookOpen, LayoutDashboard, Tag, Tags, Trophy, Users } from 'lucide-react'

// Daftar menu di sidebar dan topbar admin.
export const adminMenu = [
  { name: 'Ringkasan', href: '/admin', icon: LayoutDashboard },
  { name: 'Kategori', href: '/admin/kategori', icon: Tags },
  { name: 'Kelas', href: '/admin/kelas', icon: BookOpen },
  { name: 'Tag Jenis Konten', href: '/admin/tag', icon: Tag },
  { name: 'Tantangan', href: '/admin/tantangan', icon: Trophy },
  { name: 'Pelajar', href: '/admin/pelajar', icon: Users },
  { name: 'Notifikasi', href: '/admin/notifikasi', icon: Bell },
  { name: 'Laporan', href: '/admin/laporan', icon: BarChart3 },
]
