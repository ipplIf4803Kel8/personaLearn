import { HEADING_FONT, PRIMARY_COLOR } from '@/components/pelajar/theme'
import { cn } from '@/lib/utils'

export function ProgressBar({ value, className }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-[#ECE7FF]', className)}>
      <div className="h-full rounded-full bg-[#5F33E1] transition-all" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

/** Cincin progres (Aktifitas Anda, Semua Kelas). */
export function ProgressRing({ value, size = 96, stroke = 9, className, labelClass = 'text-lg' }) {
  const r = (size - stroke) / 2
  const k = 2 * Math.PI * r
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ECE7FF" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={PRIMARY_COLOR} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={k} strokeDashoffset={k * (1 - Math.min(100, value) / 100)} />
      </svg>
      <span className={cn('absolute inset-0 flex items-center justify-center font-semibold text-[#5F33E1]', HEADING_FONT, labelClass)}>{value}%</span>
    </div>
  )
}
