import { muatTantangan } from '@/data/learningApi'
import { useAsync } from '@/hooks/useAsync'
import { useRouter } from '@/lib/router'

// Mengambil tantangan aktif sesuai ?id=, atau yang pertama bila id tidak diberikan
export function useTantangan() {
  const { query } = useRouter()
  const muat = useAsync(muatTantangan, [])
  const tantangan = muat.data?.find((t) => String(t.id) === query.id) ?? (query.id ? undefined : muat.data?.[0])
  return { ...muat, tantangan }
}
