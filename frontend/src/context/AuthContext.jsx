import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken, setUnauthorizedHandler } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(getToken()))

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    setUnauthorizedHandler(logout)
    if (getToken()) {
      api('/auth/me')
        .then(setUser)
        .catch(logout)
        .finally(() => setLoading(false))
    }
  }, [])

  const authenticate = (path) => async (body) => {
    const { token, user } = await api(path, { method: 'POST', body })
    setToken(token)
    setUser(user)
    return user
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, login: authenticate('/auth/login'), register: authenticate('/auth/register') }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
