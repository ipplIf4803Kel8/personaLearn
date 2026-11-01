import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { BODY_FONT, HEADING_FONT } from '@/components/pelajar/theme'
import { cn } from '@/lib/utils'

/** Panel bawah (bottom sheet) atau dialog tengah (center). */
export function BottomSheet({ open, onClose, title, kanan, children, kode, center }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  // Dirender ke <body> supaya tidak tertutup navigasi bawah / header (stacking context layar).
  return createPortal(
    <div className={cn('fixed inset-0 z-50 flex justify-center bg-[#24252C]/45', BODY_FONT, center ? 'items-center p-6' : 'items-end')} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        data-screen={kode}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full max-w-md bg-white text-[#24252C] shadow-2xl',
          center ? 'rounded-3xl p-7' : 'max-h-[88vh] overflow-y-auto rounded-t-[2rem] px-6 pt-4 pb-8',
        )}
      >
        {!center && <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-[#D9D9DE]" />}
        {title && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className={cn('text-xl font-semibold text-[#24252C]', HEADING_FONT)}>{title}</h2>
            {kanan}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}
