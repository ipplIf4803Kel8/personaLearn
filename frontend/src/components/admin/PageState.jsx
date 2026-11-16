import { Skeleton } from '@/components/ui/skeleton'

// Tampilan status untuk halaman admin: memuat / gagal / pesan error.
export function PageState({ loading, error }) {
  if (!loading && !error) return null
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-7 md:py-8">
      {loading ? (
        <div className="space-y-3" role="status" aria-label="Memuat data">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

// Kolom Aksi tabel: menempel di kanan agar tombol selalu terlihat di layar sempit
export const STICKY_ACTION = 'sticky right-0 bg-background shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.12)]'

export function ActionError({ message, className = '' }) {
  return message ? (
    <p role="alert" className={`text-sm text-destructive ${className}`}>
      {message}
    </p>
  ) : null
}

export function FormError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
      {children}
    </p>
  )
}

export function FieldError({ message }) {
  return message ? (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  ) : null
}
