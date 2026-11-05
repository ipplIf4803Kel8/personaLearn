import { MdCheckCircle, MdWifiOff } from 'react-icons/md'
import { Screen } from '@/components/pelajar/Screen'
import { Spinner, Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { cn } from '@/lib/utils'

export function Loading({ label = 'Memuat...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <Spinner />
      <span className="text-xs">{label}</span>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      {Icon && <Icon className="size-16 text-[#9C9AA5]" />}
      <p className="text-base font-bold text-[#24252C]">{title}</p>
      {desc && <p className="text-sm text-[#6E6A7C]">{desc}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({ title = 'Gagal memuat data', desc = 'Koneksi sedang bermasalah. Periksa jaringan Anda lalu coba lagi.', onRetry, label = 'Coba lagi' }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-8 text-center">
      <div className="flex size-28 items-center justify-center rounded-full bg-[#EEE9FF] text-[#5F33E1]">
        <MdWifiOff className="size-12" />
      </div>
      <p className={cn('mt-2 text-lg font-semibold text-[#24252C]', HEADING_FONT)}>{title}</p>
      <p className="text-sm text-[#6E6A7C]">{desc}</p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-3 min-w-56 py-3">
          {label}
        </Button>
      )}
    </div>
  )
}

/** Banner hijau di atas layar (UC4-L03, UC4-L05). */
export function SuccessBanner({ children }) {
  return (
    <div role="status" className="flex items-center gap-3 rounded-xl bg-[#E8F7EE] px-4 py-3 text-[15px] text-[#1E7A46]">
      <MdCheckCircle className="size-5 shrink-0 text-[#22A45D]" />
      {children}
    </div>
  )
}

/** Layar konfirmasi berhasil (UC1-L04, UC1-L08, UC2-L05, ...). */
export function SuccessScreen({ kode, title, desc, action, onAction, secondary, onSecondary, icon: Icon = MdCheckCircle }) {
  return (
    <Screen kode={kode} header={false}>
      <div className="flex min-h-[90vh] flex-col items-center justify-center text-center">
        <div className="flex size-28 items-center justify-center rounded-full bg-[#EEE9FF] text-[#5F33E1]">
          <Icon className="size-16" />
        </div>
        <h1 className={cn('mt-8 text-xl font-bold text-[#24252C]', HEADING_FONT)}>{title}</h1>
        {desc && <p className="mt-3 text-sm text-[#6E6A7C]">{desc}</p>}
        <Button className="mt-10 w-full" onClick={onAction}>
          {action}
        </Button>
        {secondary && (
          <Button variant="ghost" className="mt-2 w-full" onClick={onSecondary}>
            {secondary}
          </Button>
        )}
      </div>
    </Screen>
  )
}
