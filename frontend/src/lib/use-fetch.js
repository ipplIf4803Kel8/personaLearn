import { useCallback, useEffect, useState } from 'react'
import { api, fetchCache } from '@/lib/api'

const initial = (path) => (fetchCache.has(path) ? { data: fetchCache.get(path), error: null, loading: false } : { data: null, error: null, loading: true })
export const prefetch = (path) => api(path).then((data) => fetchCache.set(path, data)).catch(() => {})

export function useFetch(path) {
  const [state, setState] = useState(() => initial(path))

  const reload = useCallback(
    () =>
      api(path)
        .then((data) => {
          fetchCache.set(path, data)
          setState({ data, error: null, loading: false })
        })
        .catch((err) => setState((s) => ({ ...s, error: err.message, loading: false }))),
    [path]
  )

  useEffect(() => {
    setState(initial(path))
    reload()
  }, [reload])

  return { ...state, reload }
}

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
