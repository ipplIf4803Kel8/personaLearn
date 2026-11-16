import { useState } from 'react'

// Seperti useAction, tetapi error bisa dibersihkan (saat sheet dibuka) agar tidak tersisa dari aksi sebelumnya.
export function useAdminAction(reload) {
  const [error, setError] = useState(null)

  async function run(fn) {
    setError(null)
    try {
      await fn()
      await reload()
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  return [run, error, () => setError(null)]
}
