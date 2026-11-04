import { createContext, useContext, useState } from 'react'
import { useRouter } from '@/lib/router'

// Pembantu navigasi untuk sidebar & topbar admin (memakai router aplikasi, alamat #/admin/...),
// ditambah kata kunci pencarian dari kotak "Cari data..." di topbar (dipakai untuk menyaring tabel).

const SearchContext = createContext({ query: '', setQuery: () => {} })

/** Menyimpan kata kunci pencarian admin. Kata kunci dikosongkan otomatis saat pindah halaman. */
export function AdminSearchProvider({ children }) {
  const { path } = useRouter()
  const [state, setState] = useState({ path, query: '' })
  const query = state.path === path ? state.query : ''
  const setQuery = (q) => setState({ path, query: q })
  return <SearchContext.Provider value={{ query, setQuery }}>{children}</SearchContext.Provider>
}

export function useAdminNavigation() {
  const { path, navigate } = useRouter()
  const { query, setQuery } = useContext(SearchContext)
  return { pathname: path, navigate, query, setQuery }
}

/** true kalau kata kunci kosong, atau ada di salah satu kolom. */
export const matchesQuery = (query, ...fields) => {
  const q = query.trim().toLowerCase()
  return !q || fields.some((f) => String(f ?? '').toLowerCase().includes(q))
}

export function AdminLink({ href, onClick, ...props }) {
  const { navigate } = useRouter()
  function handleClick(event) {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(href)
  }
  return <a href={`#${href}`} onClick={handleClick} {...props} />
}
