import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Komponen kecil bersama halaman admin: dialog konfirmasi, pesan error, dan header halaman.

function ConfirmDialog({ open, title, description, warning, confirmLabel = 'Hapus', loading, onConfirm, onCancel, screen }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onCancel?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        data-screen={screen}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" aria-label="Tutup" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        {warning && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{warning}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button variant="destructive" disabled={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

function FormError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
      {children}
    </p>
  )
}

function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

const selectClass =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

const textareaClass =
  'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

// Label dan warna badge status kelas (dipakai halaman Kelas & Detail Kelas).
const CLASS_STATUS = {
  draf: { label: 'Draf', variant: 'secondary' },
  terbit: { label: 'Terbit', variant: 'default' },
  disembunyikan: { label: 'Disembunyikan', variant: 'outline' },
}

export { ConfirmDialog, FormError, PageHeader, CLASS_STATUS, selectClass, textareaClass }
