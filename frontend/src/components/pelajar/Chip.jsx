import { cn } from '@/lib/utils'

export function Chip({ aktif, kecil, className, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={aktif ? true : undefined}
      {...props}
      className={cn(
        'shrink-0 rounded-full border transition',
        kecil ? 'px-3.5 py-1.5 text-sm' : 'px-4 py-2 text-sm',
        aktif ? 'border-transparent bg-[#E2D9FF] font-medium text-[#5F33E1]' : 'border-[#D6D6DC] bg-white text-[#6E6A7C] hover:border-[#5F33E1]/40',
        className,
      )}
    />
  )
}
