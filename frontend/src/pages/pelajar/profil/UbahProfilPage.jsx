import { useEffect, useRef, useState } from 'react'
import { MdDeleteOutline, MdErrorOutline, MdOutlineCameraAlt, MdOutlineImage } from 'react-icons/md'
import { Avatar } from '@/components/pelajar/Avatar'
import { inputClass, FormField } from '@/components/pelajar/FormField'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { ProfileLayout } from '@/components/pelajar/ProfileLayout'
import { Button } from '@/components/pelajar/Button'
import { api } from '@/lib/api'
import { useToast } from '@/components/pelajar/Toast'
import { useAuth } from '@/context/AuthContext'
import { clearAsyncCache } from '@/hooks/useAsync'
import { validateFoto, validateProfil } from '@/lib/profilValidation'
import { useProfil } from '@/lib/useProfil'
import { useRouter } from '@/lib/router'

function FormUbahProfil({ profil }) {
  const { navigate } = useRouter()
  const { refreshUser } = useAuth()
  const toast = useToast()
  const [f, setF] = useState({ nama: profil.name, email: profil.email, telepon: profil.phone ?? '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [err, setErr] = useState({})
  const [gagal, setGagal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pilihFoto, setPilihFoto] = useState(false)
  const [errSheet, setErrSheet] = useState('')
  const [fotoDihapus, setFotoDihapus] = useState(false)
  const [menghapus, setMenghapus] = useState(false)
  const kamera = useRef(null)
  const galeri = useRef(null)
  const tutup = () => navigate('/profil', { replace: true })

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  async function pilih(e) {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return
    const pesan = await validateFoto(picked)
    setErr((x) => ({ ...x, foto: pesan }))
    setPilihFoto(false)
    if (pesan) {
      toast(pesan, 'gagal')
      return
    }
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }

  async function hapusFoto() {
    setErrSheet('')
    if (!preview) {
      setMenghapus(true)
      try {
        await api('/me/avatar', { method: 'DELETE' })
        clearAsyncCache()
        refreshUser().catch(() => {})
        setFotoDihapus(true)
      } catch (e) {
        setErrSheet(e.message || 'Foto gagal dihapus. Coba lagi.')
        return
      } finally {
        setMenghapus(false)
      }
      toast('Foto profil dihapus')
    }
    setFile(null)
    setPreview(null)
    setErr((x) => ({ ...x, foto: '' }))
    setPilihFoto(false)
  }

  async function simpan() {
    const errors = validateProfil(f)
    setErr(errors)
    setGagal(false)
    if (Object.keys(errors).length) return
    setLoading(true)
    let profilTersimpan = false
    try {
      // Foto sudah divalidasi saat dipilih; cek ulang sebelum menyimpan apa pun agar tidak ada simpan sebagian.
      if (file) {
        const pesan = await validateFoto(file)
        if (pesan) {
          setErr({ foto: pesan })
          return
        }
      }
      await api('/me/profile', { method: 'PUT', body: { name: f.nama, email: f.email, phone: f.telepon } })
      profilTersimpan = true
      if (file) {
        const body = new FormData()
        body.append('avatar', file)
        await api('/me/avatar', { method: 'POST', body })
      }
      clearAsyncCache()
      await refreshUser().catch(() => {})
      navigate('/profil/ubah/berhasil', { replace: true })
    } catch (e) {
      if (profilTersimpan) {
        clearAsyncCache()
        refreshUser().catch(() => {})
        setFile(null)
        setPreview(null)
        setErr({ foto: `Profil tersimpan, tetapi foto gagal diunggah: ${e.errors?.avatar || e.message || 'coba lagi'}. Pilih foto lagi lalu simpan.` })
      } else if (e.errors) setErr({ nama: e.errors.name, email: e.errors.email, telepon: e.errors.phone, foto: e.errors.avatar })
      else setGagal(true)
    } finally {
      setLoading(false)
    }
  }

  const ubah = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return (
    <>
      <BottomSheet open={!pilihFoto} onClose={tutup} title="Ubah Profil">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar u={{ nama: f.nama, foto: preview ?? (fotoDihapus ? null : profil.avatarUrl) }} className="size-16 text-xl" />
            <Button variant="outline" onClick={() => setPilihFoto(true)}>
              Ubah Foto Profil
            </Button>
          </div>
          {err.foto && (
            <p role="alert" className="flex items-center gap-1.5 text-xs text-[#C8303C]">
              <MdErrorOutline className="size-4 shrink-0" />
              {err.foto}
            </p>
          )}
          <FormField label="Nama" error={err.nama}>
            <input value={f.nama} placeholder="Masukkan nama Anda" onChange={ubah('nama')} className={inputClass} aria-invalid={!!err.nama} />
          </FormField>
          <FormField label="Email" error={err.email}>
            <input type="email" value={f.email} placeholder="nama@email.com" onChange={ubah('email')} className={inputClass} aria-invalid={!!err.email} />
          </FormField>
          <FormField label="Nomor Telepon" error={err.telepon}>
            <input type="tel" value={f.telepon} placeholder="+62 812 3456 7890" onChange={ubah('telepon')} className={inputClass} aria-invalid={!!err.telepon} />
          </FormField>
          {gagal && (
            <p role="alert" className="flex items-start gap-3 rounded-xl bg-[#FDECEE] px-4 py-3 text-sm text-[#C8303C]">
              <MdErrorOutline className="mt-0.5 size-5 shrink-0" />
              Perubahan profil gagal disimpan. Periksa koneksi Anda lalu coba lagi.
            </p>
          )}
          <Button className="w-full" loading={loading} onClick={simpan}>
            {gagal ? 'Coba Lagi' : 'Simpan'}
          </Button>
        </div>
      </BottomSheet>

      <input ref={kamera} type="file" accept="image/jpeg,image/png,image/webp" capture="user" hidden onChange={pilih} />
      <input ref={galeri} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pilih} />
      <BottomSheet open={pilihFoto} onClose={() => { setPilihFoto(false); setErrSheet('') }} title="Ubah Foto Profil" kode="UC4-L07">
        <div className="space-y-3">
          {[
            ['Ambil Foto', MdOutlineCameraAlt, kamera],
            ['Pilih dari Galeri', MdOutlineImage, galeri],
          ].map(([label, Icon, input]) => (
            <button key={label} type="button" onClick={() => input.current?.click()} className="flex w-full items-center gap-4 rounded-xl bg-[#F7F5FF] px-5 py-4 text-left text-base text-[#24252C]">
              <Icon className="size-7 text-[#5F33E1]" />
              {label}
            </button>
          ))}
          {(preview || (profil.avatarUrl && !fotoDihapus)) && (
            <button type="button" disabled={menghapus} onClick={hapusFoto} className="flex w-full items-center gap-4 rounded-xl bg-[#FDECEE] px-5 py-4 text-left text-base text-[#C8303C] disabled:opacity-60">
              <MdDeleteOutline className="size-7" />
              {menghapus ? 'Menghapus...' : 'Hapus Foto'}
            </button>
          )}
          {errSheet && (
            <p role="alert" className="flex items-center gap-1.5 text-xs text-[#C8303C]">
              <MdErrorOutline className="size-4 shrink-0" />
              {errSheet}
            </p>
          )}
          <p className="text-xs text-subtle">Format JPG, PNG, atau WebP, maksimal 2 MB.</p>
          <Button variant="outline" className="w-full" onClick={() => setPilihFoto(false)}>
            Batal
          </Button>
        </div>
      </BottomSheet>
    </>
  )
}

// UC4-L02 Ubah Profil (+ UC4-L07 Pilih Foto Profil; kondisi B: data tidak valid / gagal disimpan)
export function UbahProfilPage() {
  const profil = useProfil()
  return <ProfileLayout kode="UC4-L02">{profil.data && <FormUbahProfil profil={profil.data} />}</ProfileLayout>
}
