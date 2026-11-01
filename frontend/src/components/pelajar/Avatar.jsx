import { HEADING_FONT } from '@/components/pelajar/theme'
import { cn } from '@/lib/utils'

export function Avatar({ u, className = 'size-24 text-2xl' }) {
  if (u?.foto) return <img src={u.foto} alt="" className={cn('rounded-full object-cover', className)} />
  return (
    <div className={cn('flex items-center justify-center rounded-full bg-gradient-to-br from-[#E2D9FF] to-[#CBB9FF] font-semibold text-[#5F33E1]', HEADING_FONT, className)}>
      {(u?.nama ?? '?').slice(0, 1).toUpperCase()}
    </div>
  )
}
