import { useRouter } from '@/lib/router'

// Pembantu navigasi untuk sidebar & topbar admin (memakai router aplikasi, alamat #/admin/...).
export function useAdminNavigation() {
  const { path, navigate } = useRouter()
  return { pathname: path, navigate }
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
