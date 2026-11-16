import { HEADING_FONT, PRIMARY_COLOR } from '@/components/pelajar/theme'
import { cn } from '@/lib/utils'

const clamp = (v) => Math.min(100, Math.max(0, Math.round(Number(v) || 0)))

export function ProgressBar({ value, className }) {
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamp(value)} className={cn('h-2 w-full overflow-hidden rounded-full bg-[#ECE7FF]', className)}>
      <div className="h-full rounded-full bg-[#5F33E1] transition-all" style={{ width: `${clamp(value)}%` }} />
    </div>
  )
}

/** Cincin progres (Aktifitas Anda, Semua Kelas). */
export function ProgressRing({ value, size = 96, stroke = 9, className, labelClass = 'text-lg' }) {
  const pct = clamp(value)
  const r = (size - stroke) / 2
  const k = 2 * Math.PI * r
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ECE7FF" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={PRIMARY_COLOR} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={k} strokeDashoffset={k * (1 - pct / 100)} />
      </svg>
      <span className={cn('absolute inset-0 flex items-center justify-center font-semibold text-[#5F33E1]', HEADING_FONT, labelClass)}>{pct}%</span>
    </div>
  )
}
