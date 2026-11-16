import { useState } from 'react'
import { MdErrorOutline, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { cn } from '@/lib/utils'

export const inputClass =
  'w-full rounded-xl border border-[#E6E6EA] bg-white px-5 py-4 text-sm text-[#24252C] outline-none placeholder:text-subtle focus:border-[#5F33E1] focus:ring-4 focus:ring-[#5F33E1]/10 aria-[invalid=true]:border-[#C8303C]'

export function FormField({ label, error, hint, children }) {
  return (
    <label className="block space-y-2">
      {label && <span className={cn('text-sm font-semibold text-[#24252C]', HEADING_FONT)}>{label}</span>}
      {children}
      {error ? (
        <span role="alert" className="flex items-center gap-1.5 text-xs text-[#C8303C]">
          <MdErrorOutline className="size-4 shrink-0" />
          {error}
        </span>
      ) : (
        hint && <span className="text-xs text-slate-500">{hint}</span>
      )}
    </label>
  )
}

/** Kolom bergaya Figma dengan ikon di kiri (Profil). */
export function IconField({ icon: Icon, children, kanan, className, ...props }) {
  return (
    <div className={cn('flex items-center gap-4 rounded-xl border border-[#E6E6EA] bg-white px-5 py-4 text-subtle', className)} {...props}>
      {Icon && <Icon className="size-6 shrink-0 text-subtle" />}
      <div className="min-w-0 flex-1 truncate">{children}</div>
      {kanan}
    </div>
  )
}

/** Kolom kata sandi dengan tombol lihat/sembunyi (area sentuh 40x40). */
export function PasswordInput({ as: Input = 'input', className, label = 'kata sandi', ...props }) {
  const [tampil, setTampil] = useState(false)
  return (
    <div className="relative">
      <Input {...props} type={tampil ? 'text' : 'password'} className={cn(className, 'pr-14')} />
      <button
        type="button"
        onClick={() => setTampil((v) => !v)}
        aria-label={`${tampil ? 'Sembunyikan' : 'Tampilkan'} ${label}`}
        aria-pressed={tampil}
        className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-subtle transition-colors hover:text-[#24252C]"
      >
        {tampil ? <MdVisibilityOff className="size-5" /> : <MdVisibility className="size-5" />}
      </button>
    </div>
  )
}
