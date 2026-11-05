import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { MdCheckCircle, MdErrorOutline } from 'react-icons/md'
import { cn } from '@/lib/utils'

export const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const show = useCallback((pesan, jenis = 'sukses') => {
    setToast({ pesan, jenis, id: Date.now() })
  }, [])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
          <div
            role="status"
            className={cn(
              'pointer-events-auto flex max-w-md items-center gap-2 rounded-xl px-4 py-3 text-xs font-medium shadow-lg',
              toast.jenis === 'gagal' ? 'bg-[#FDECEE] text-[#C8303C]' : 'bg-[#E8F7EE] text-[#1E7A46]',
            )}
          >
            {toast.jenis === 'gagal' ? <MdErrorOutline className="size-5" /> : <MdCheckCircle className="size-5 text-[#22A45D]" />}
            {toast.pesan}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
