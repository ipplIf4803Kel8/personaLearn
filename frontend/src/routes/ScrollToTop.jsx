import { useEffect } from 'react'
import { useLocation } from 'react-router'

/** Gulir ke paling atas setiap kali pindah halaman. */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
