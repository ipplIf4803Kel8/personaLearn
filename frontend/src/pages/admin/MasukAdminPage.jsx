import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { validateLogin } from '@/lib/validators'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/lib/router'
import { FormError } from '@/components/admin/PageState'
import { PersonaLearnLogo } from '@/components/admin/Logo'

// UC1-L09 Masuk Admin
function MasukAdminPage() {
  const { navigate } = useRouter()
  const { login, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [kataSandi, setKataSandi] = useState('')
  const [lihat, setLihat] = useState(false)
  const [pesan, setPesan] = useState('')
  const [loading, setLoading] = useState(false)

  async function masuk(e) {
    e.preventDefault()
    const salah = validateLogin({ email, password: kataSandi })
    if (Object.keys(salah).length) return setPesan('Isi email dan kata sandi dengan benar.')
    setLoading(true)
    setPesan('')
    try {
      const user = await login({ email: email.trim(), password: kataSandi })
      if (user.role !== 'admin') {
        logout()
        return setPesan('Akun ini bukan akun admin.')
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      setPesan(err.message) // mis. "Email atau kata sandi salah" / "Tidak dapat terhubung ke server"
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-screen="UC1-L09" className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <form onSubmit={masuk} noValidate className="w-full max-w-sm space-y-5 rounded-2xl border bg-background p-8 shadow-sm">
        <PersonaLearnLogo className="h-7 w-auto" />
        <div>
          <h1 className="text-2xl font-semibold">Masuk Admin</h1>
          <p className="text-sm text-muted-foreground">Kelola kelas, kategori, tag, dan pelajar.</p>
        </div>
        <FormError>{pesan}</FormError>
        <div className="space-y-1.5">
          <label htmlFor="admin-email" className="text-sm font-medium">
            Email
          </label>
          <Input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="admin-sandi" className="text-sm font-medium">
            Kata sandi
          </label>
          <div className="relative">
            <Input id="admin-sandi" type={lihat ? 'text' : 'password'} autoComplete="current-password" value={kataSandi} onChange={(e) => setKataSandi(e.target.value)} className="pr-10" />
            <button type="button" aria-label={lihat ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setLihat((v) => !v)} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
              {lihat ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>
        <button type="button" onClick={() => navigate('/masuk')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
          Masuk sebagai pelajar
        </button>
      </form>
    </div>
  )
}

export { MasukAdminPage }
