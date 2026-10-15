import {
  BarChart3,
  Bell,
  BookOpen,
  LayoutDashboard,
  Tags,
  Trophy,
  Users,
} from 'lucide-react'

const categories = [
  { id: 1, name: 'Pemrograman', slug: 'pemrograman' },
  { id: 2, name: 'Desain', slug: 'desain' },
  { id: 3, name: 'Bahasa', slug: 'bahasa' },
  { id: 4, name: 'Bisnis', slug: 'bisnis' },
]

const lessonsByCourse = {
  1: [
    { id: 101, title: 'Pengenalan JavaScript', durationSeconds: 540, position: 1 },
    { id: 102, title: 'Variabel dan Tipe Data', durationSeconds: 620, position: 2 },
    { id: 103, title: 'Fungsi dan Scope', durationSeconds: 700, position: 3 },
  ],
  2: [
    { id: 201, title: 'Dasar Tipografi', durationSeconds: 480, position: 1 },
    { id: 202, title: 'Teori Warna', durationSeconds: 510, position: 2 },
  ],
  3: [
    { id: 301, title: 'Greeting dan Perkenalan', durationSeconds: 400, position: 1 },
    { id: 302, title: 'Percakapan Sehari-hari', durationSeconds: 450, position: 2 },
  ],
}

const courses = [
  {
    id: 1,
    categoryId: 1,
    title: 'Dasar Pemrograman JavaScript',
    description: 'Belajar fondasi JavaScript dari nol untuk pemula.',
    level: 'Beginner',
    thumbnailUrl: '',
    isPublished: true,
    varkTags: ['visual', 'reading'],
    personalityTags: ['structured'],
    studentsCount: 128,
    rating: 4.6,
  },
  {
    id: 2,
    categoryId: 2,
    title: 'Prinsip Desain UI Modern',
    description: 'Memahami tipografi, warna, dan tata letak untuk antarmuka digital.',
    level: 'Intermediate',
    thumbnailUrl: '',
    isPublished: true,
    varkTags: ['visual'],
    personalityTags: ['exploratory'],
    studentsCount: 94,
    rating: 4.8,
  },
  {
    id: 3,
    categoryId: 3,
    title: 'Bahasa Inggris Percakapan',
    description: 'Latihan percakapan bahasa Inggris untuk kebutuhan sehari-hari.',
    level: 'Beginner',
    thumbnailUrl: '',
    isPublished: false,
    varkTags: ['auditory'],
    personalityTags: ['collaborative'],
    studentsCount: 61,
    rating: 4.3,
  },
]

const challenges = [
  {
    id: 1,
    title: 'Selesaikan 3 Pelajaran Minggu Ini',
    description: 'Tuntaskan 3 pelajaran dari kelas mana pun sebelum akhir minggu.',
    rewardPoints: 50,
    startsAt: '2026-03-02',
    endsAt: '2026-03-08',
    courseId: null,
  },
  {
    id: 2,
    title: 'Tuntaskan Dasar Pemrograman JavaScript',
    description: 'Selesaikan seluruh pelajaran di kelas Dasar Pemrograman JavaScript.',
    rewardPoints: 100,
    startsAt: '2026-03-02',
    endsAt: '2026-03-15',
    courseId: 1,
  },
]

const students = [
  {
    id: 1,
    name: 'Samsul Arifin',
    email: 'samsul@example.com',
    phone: '081234567890',
    avatarUrl: '',
    isActive: true,
    mbtiType: 'INTP',
    varkStyle: 'visual',
    enrollments: [
      { courseId: 1, progressPercent: 67 },
      { courseId: 2, progressPercent: 20 },
    ],
  },
  {
    id: 2,
    name: 'Dewi Lestari',
    email: 'dewi@example.com',
    phone: '081298765432',
    avatarUrl: '',
    isActive: true,
    mbtiType: 'ENFJ',
    varkStyle: 'auditory',
    enrollments: [{ courseId: 3, progressPercent: 100 }],
  },
  {
    id: 3,
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '081355512345',
    avatarUrl: '',
    isActive: false,
    mbtiType: null,
    varkStyle: 'reading',
    enrollments: [],
  },
]

const sentNotifications = [
  {
    id: 1,
    title: 'Tantangan baru sudah tersedia',
    body: 'Cek tantangan mingguan terbaru di halaman Kelas Saya.',
    audience: 'Semua Pelajar',
    sentAt: '2026-03-02T08:00:00',
  },
  {
    id: 2,
    title: 'Promo kelas Desain UI',
    body: 'Diskon akses premium kelas Prinsip Desain UI Modern minggu ini.',
    audience: 'Semua Pelajar',
    sentAt: '2026-02-26T10:30:00',
  },
]

const weeklySignups = [
  { week: 'Minggu 1', count: 12 },
  { week: 'Minggu 2', count: 18 },
  { week: 'Minggu 3', count: 9 },
  { week: 'Minggu 4', count: 24 },
  { week: 'Minggu 5', count: 20 },
  { week: 'Minggu 6', count: 31 },
]

const adminNavigation = [
  { name: 'Ringkasan', href: '/admin', icon: LayoutDashboard },
  { name: 'Kategori', href: '/admin/categories', icon: Tags },
  { name: 'Kelas', href: '/admin/classes', icon: BookOpen },
  { name: 'Tantangan', href: '/admin/challenges', icon: Trophy },
  { name: 'Pelajar', href: '/admin/students', icon: Users },
  { name: 'Notifikasi', href: '/admin/notifications', icon: Bell },
  { name: 'Laporan', href: '/admin/reports', icon: BarChart3 },
]

const currentAdmin = {
  name: 'Admin personaLearn',
  email: 'admin@personalearn.id',
  initials: 'AP',
  avatar: '',
}

function getStats() {
  const totalStudents = students.length
  const totalCourses = courses.length
  const activeStudents7d = students.filter((student) => student.isActive).length
  const lessonsCompletedThisWeek = students.reduce(
    (sum, student) => sum + student.enrollments.length,
    0
  )
  return { totalStudents, totalCourses, activeStudents7d, lessonsCompletedThisWeek }
}

function getTopCourses(limit = 5) {
  return [...courses].sort((a, b) => b.studentsCount - a.studentsCount).slice(0, limit)
}

function getAverageProgressByCourse() {
  return courses.map((course) => {
    const enrollments = students.flatMap((student) =>
      student.enrollments.filter((enrollment) => enrollment.courseId === course.id)
    )
    const average = enrollments.length
      ? Math.round(enrollments.reduce((sum, enrollment) => sum + enrollment.progressPercent, 0) / enrollments.length)
      : 0
    return { course, averageProgress: average, enrolledCount: enrollments.length }
  })
}

function getRatingExtremes() {
  const sorted = [...courses].sort((a, b) => b.rating - a.rating)
  return { highest: sorted[0] ?? null, lowest: sorted[sorted.length - 1] ?? null }
}

const chatMessageStats = { totalMessages: 342, thisWeek: 58 }

export {
  categories,
  courses,
  lessonsByCourse,
  challenges,
  students,
  sentNotifications,
  weeklySignups,
  adminNavigation,
  currentAdmin,
  getStats,
  getTopCourses,
  getAverageProgressByCourse,
  getRatingExtremes,
  chatMessageStats,
}
