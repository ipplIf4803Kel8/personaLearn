import { HiAcademicCap, HiDocumentText, HiHome, HiUser } from 'react-icons/hi'
import { NotificationBell } from '@/components/pelajar/NotificationBell'
import { BODY_FONT, HEADING_FONT } from '@/components/pelajar/theme'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

export function BackIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-6', className)}>
      <path d="M3 12 11 6.5v11z" fill="currentColor" />
      <rect x="11" y="10.6" width="9" height="2.8" rx="1.4" fill="currentColor" />
    </svg>
  )
}

export function DecorativeBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -top-10 -left-16 h-56 w-56 rounded-full bg-green-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-56 w-56 rounded-full bg-amber-100/50 blur-3xl" />
    </>
  )
}

/**
 * Bingkai layar aplikasi Pelajar (mobile-first, di desktop tampil di tengah).
 * kode: kode layar DPPL (mis. "UC2-L01"), disimpan sebagai data-screen untuk pengujian.
 * bell: tampilkan lonceng notifikasi di kanan header (seperti di Figma).
 */
export function Screen({ kode, title, back, actions, bell, nav, children, className, blobs = true, header = true, latar = 'bg-white' }) {
  const { back: kembali } = useRouter()
  return (
    <div className={cn('min-h-screen w-full bg-slate-100 text-[#24252C] md:py-6', BODY_FONT)}>
      <div
        data-screen={kode}
        className={cn('relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden md:min-h-[calc(100vh-3rem)] md:rounded-[2rem] md:shadow-xl', latar)}
      >
        {blobs && <DecorativeBackground />}
        {header && (title || back || actions || bell) && (
          <header className="sticky top-0 z-30 grid grid-cols-[3rem_1fr_auto] items-center gap-2 bg-white/85 px-4 pt-4 pb-3 backdrop-blur">
            <div>
              {back && (
                <button
                  type="button"
                  aria-label="Kembali"
                  onClick={() => (typeof back === 'function' ? back() : kembali(typeof back === 'string' ? back : undefined))}
                  className="-ml-1 flex size-10 items-center justify-center text-[#24252C]"
                >
                  <BackIcon />
                </button>
              )}
            </div>
            <h1 className={cn('truncate text-center text-lg font-semibold text-[#24252C]', HEADING_FONT)}>{title}</h1>
            <div className="flex min-w-12 items-center justify-end">
              {actions}
              {bell && <NotificationBell />}
            </div>
          </header>
        )}
        <main className={cn('relative z-10 flex-1 px-6 pb-6', nav && 'pb-28', className)}>{children}</main>
        {nav && <BottomNav />}
      </div>
    </div>
  )
}

export const BOTTOM_NAV_ITEMS = [
  { to: '/beranda', label: 'Beranda', icon: HiHome, match: ['/beranda', '/rekomendasi'] },
  { to: '/cari', label: 'Cari Kelas', icon: HiAcademicCap, match: ['/cari', '/populer', '/favorit', '/kelas/'] },
  { to: '/kelas-anda', label: 'Kelas Anda', icon: HiDocumentText, match: ['/kelas-anda', '/belajar', '/statistik', '/tantangan'] },
  { to: '/profil', label: 'Profil', icon: HiUser, match: ['/profil'] },
]

export function BottomNav() {
  const { path, navigate } = useRouter()
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-white px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgba(36,37,44,0.06)] md:bottom-6 md:rounded-b-[2rem]">
      <ul className="grid grid-cols-4">
        {BOTTOM_NAV_ITEMS.map(({ to, label, icon: Icon, match }) => {
          const aktif = match.some((m) => path === m || path.startsWith(m))
          return (
            <li key={to} className="flex justify-center">
              <button
                type="button"
                aria-label={label}
                aria-current={aktif ? 'page' : undefined}
                onClick={() => navigate(to)}
                className={cn('flex size-11 items-center justify-center rounded-xl transition', aktif ? 'text-[#5F33E1]' : 'text-[#C9CBD3] hover:text-slate-400')}
              >
                <Icon className="size-8" />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function SectionTitle({ children, action, className }) {
  return (
    <div className={cn('mt-7 mb-4 flex items-center justify-between', className)}>
      <h2 className="text-lg font-medium text-[#24252C]">{children}</h2>
      {action}
    </div>
  )
}
