import { useEffect, useState } from 'react'

/** Hook kecil untuk memuat data async dengan state memuat/gagal/coba lagi. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ memuat: true, gagal: false, data: null })
  const [n, setN] = useState(0)
  useEffect(() => {
    let batal = false
    setState((s) => ({ ...s, memuat: true, gagal: false }))
    fn()
      .then((data) => !batal && setState({ memuat: false, gagal: false, data }))
      .catch(() => !batal && setState({ memuat: false, gagal: true, data: null }))
    return () => {
      batal = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n])
  return { ...state, ulangi: () => setN((x) => x + 1) }
}
