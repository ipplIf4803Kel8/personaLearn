// Setelah login: Admin ke dashboard, Pelajar baru ke UC1-L12, selebihnya ke Beranda.
export function getHomePath(u) {
  if (u.peran === 'admin') return '/admin'
  return u.onboardingSelesai ? '/beranda' : '/kenali-gaya-belajar'
}
