import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken, setUnauthorizedHandler } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(getToken()))
  const [loadError, setLoadError] = useState('')

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  // Hanya 401/403 yang me-logout; gangguan jaringan atau 5xx menampilkan layar coba lagi.
  const loadUser = () => {
    setLoadError('')
    setLoading(true)
    api('/auth/me')
      .then(setUser)
      .catch((err) => {
        if (err.status === 401 || err.status === 403) logout()
        else setLoadError(err.message)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setUnauthorizedHandler(logout)
    if (getToken()) loadUser()
    // Logout di tab lain: token dihapus -> keluar di tab ini juga
    const onStorage = (e) => {
      if ((e.key === 'token' || e.key === null) && !getToken()) setUser(null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  if (loadError) {
    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[#24252C]">{loadError}</p>
        <button type="button" onClick={loadUser} className="min-h-10 rounded-xl bg-[#5F33E1] px-6 py-2 font-semibold text-white">
          Coba Lagi
        </button>
      </div>
    )
  }

  const authenticate = (path) => async (body) => {
    const { token, user } = await api(path, { method: 'POST', body })
    setToken(token)
    setUser(user)
    return user
  }

  // Dipakai setelah data user berubah di server (mis. preferensi belajar disimpan).
  const updateUser = (changes) => setUser((u) => ({ ...u, ...changes }))

  const refreshUser = () => api('/auth/me').then(setUser)

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, updateUser, refreshUser, login: authenticate('/auth/login'), register: authenticate('/auth/register') }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
