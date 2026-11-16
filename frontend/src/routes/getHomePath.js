// Setelah login: admin ke dashboard, pelajar yang belum mengisi gaya belajar ke UC1-L12, selebihnya ke Beranda.
export function getHomePath(user) {
  if (user.role === 'admin') return '/admin'
  return user.varkStyle ? '/beranda' : '/kenali-gaya-belajar'
}
