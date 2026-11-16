import { api } from '@/lib/api'
import { useAsync } from '@/hooks/useAsync'

// Profil pelajar dari backend; hasil sama dipakai bersama oleh Profil dan Ubah Profil lewat cache useAsync
export const useProfil = () => useAsync(() => api('/me/profile').then((r) => r.data), [])
