import { HEADING_FONT } from '@/components/pelajar/theme'
import { cn } from '@/lib/utils'

export function Button({ variant = 'primary', className, loading, children, ...props }) {
  const gaya = {
    primary: 'bg-[#5F33E1] text-white shadow-[0_10px_20px_rgba(95,51,225,0.25)] hover:bg-[#5328d4]',
    secondary: 'bg-[#EEE9FF] text-[#5F33E1] hover:bg-[#E2D9FF]',
    outline: 'border-2 border-[#5F33E1] bg-white text-[#5F33E1] hover:bg-[#F5F1FF]',
    ghost: 'text-[#5F33E1] hover:bg-[#F5F1FF]',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
  }[variant]
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        HEADING_FONT,
        gaya,
        className,
      )}
    >
      {loading && <Spinner className="size-4 border-current" />}
      {children}
    </button>
  )
}

export function Spinner({ className }) {
  return <span className={cn('inline-block size-6 animate-spin rounded-full border-2 border-[#5F33E1] border-t-transparent', className)} />
}

export function TextLink({ children, ...props }) {
  return (
    <button type="button" className="text-sm font-medium text-[#5F33E1]" {...props}>
      {children}
    </button>
  )
}
