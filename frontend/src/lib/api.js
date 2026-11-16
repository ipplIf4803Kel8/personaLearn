const TOKEN_KEY = 'token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY)

let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn)

export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken()
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: {
        ...(body && !(body instanceof FormData) && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body instanceof FormData ? body : body && JSON.stringify(body),
    })
  } catch {
    throw new Error('Tidak dapat terhubung ke server')
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    // 401 pada login berarti kredensial salah, bukan sesi habis. Selain itu (termasuk token
    // yang dihapus manual di tengah sesi) tetap dianggap sesi habis.
    if (res.status === 401 && path !== '/auth/login') onUnauthorized()
    throw Object.assign(new Error(data?.message || 'Terjadi kesalahan'), { errors: data?.errors, status: res.status })
  }
  return data
}
