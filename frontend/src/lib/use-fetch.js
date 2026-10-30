import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'

export function useFetch(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true })

  const reload = useCallback(
    () =>
      api(path)
        .then((data) => setState({ data, error: null, loading: false }))
        .catch((err) => setState((s) => ({ ...s, error: err.message, loading: false }))),
    [path]
  )

  useEffect(() => {
    reload()
  }, [reload])

  return { ...state, reload }
}

// Jalankan aksi tulis (POST/PATCH/DELETE), muat ulang data, dan simpan pesan error terakhir.
export function useAction(reload) {
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

  return [run, error]
}
