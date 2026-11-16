import { Avatar } from '@/components/pelajar/Avatar'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { useAuth } from '@/context/AuthContext'
import { muatStatistik } from '@/data/learningApi'
import { useAsync } from '@/hooks/useAsync'
import { cn } from '@/lib/utils'

export function PointsIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2 20.5 7v10L12 22l-8.5-5V7z" fill="#2F80ED" />
      <path d="M12 6.5 16 9v6l-4 2.5L8 15V9z" fill="#9CC8FF" />
    </svg>
  )
}

export function StreakIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2s5.5 4.6 5.5 10.3A5.6 5.6 0 0 1 12 18a5.6 5.6 0 0 1-5.5-5.7C6.5 9 9 7.6 9 7.6s.2 2.6 2 3.4C11 6.5 12 2 12 2z" fill="#F0384B" transform="translate(0 2)" />
      <path d="M12 12.5s2.6 2 2.6 4.4A2.6 2.6 0 0 1 12 19.5a2.6 2.6 0 0 1-2.6-2.6c0-1.5 1.3-2.4 1.3-2.4s.3 1 1 1.2c0-1.6.3-3.2.3-3.2z" fill="#FFB547" transform="translate(0 2)" />
    </svg>
  )
}

/** Baris poin & streak di atas Daftar Kelas Anda. */
export function PointsBar() {
  const { user } = useAuth()
  const { data, memuat } = useAsync(muatStatistik, [])
  const poin = data?.totalPoints
  const streak = data?.currentStreak
  return (
    <div data-testid="bar-poin-streak" className="flex items-center justify-between py-2">
      <Avatar u={{ nama: user?.name }} className="size-9 text-xs" />
      <span className={cn('inline-flex items-center gap-1.5 text-lg font-semibold text-info', HEADING_FONT)} aria-label={`Total poin ${poin ?? 0}`}>
        <PointsIcon /> {memuat ? '-' : (poin ?? 0)}
      </span>
      <span className={cn('inline-flex items-center gap-1 text-lg font-semibold text-danger', HEADING_FONT)} aria-label={`Streak ${streak ?? 0} hari`}>
        <StreakIcon /> {memuat ? '-' : (streak ?? 0)}
      </span>
    </div>
  )
}
