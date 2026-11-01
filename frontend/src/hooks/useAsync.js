import { useEffect, useState } from 'react'

// Simpanan hasil terakhir per pemanggilan (fungsi + parameter). Saat halaman dibuka lagi,
// data lama langsung ditampilkan (tanpa "Memuat..."), lalu diperbarui diam-diam di belakang.
const cache = new Map()

/** Kosongkan simpanan (dipanggil saat login/keluar supaya data akun lain tidak sempat tampil). */
export function clearAsyncCache() {
  cache.clear()
}

/**
 * Hook kecil untuk memuat data async dengan state memuat/gagal/coba lagi.
 * { simpan: false } = selalu tampilkan "Memuat..." (mis. proses menyambungkan sesi).
 */
export function useAsync(fn, deps = [], { simpan = true } = {}) {
  const depKey = JSON.stringify(deps)
  const key = simpan ? fn.toString() + depKey : null
  const [state, setState] = useState(() =>
    cache.has(key) ? { memuat: false, gagal: false, data: cache.get(key) } : { memuat: true, gagal: false, data: null },
  )
  const [n, setN] = useState(0)
  useEffect(() => {
    let batal = false
    const adaSimpanan = cache.has(key)
    if (adaSimpanan) setState({ memuat: false, gagal: false, data: cache.get(key) })
    else setState((s) => ({ ...s, memuat: true, gagal: false }))
    fn()
      .then((data) => {
        if (key) cache.set(key, data)
        if (!batal) setState({ memuat: false, gagal: false, data })
      })
      .catch(() => {
        cache.delete(key)
        if (!batal) setState({ memuat: false, gagal: true, data: null })
      })
    return () => {
      batal = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, depKey, n])
  return { ...state, ulangi: () => setN((x) => x + 1) }
}
