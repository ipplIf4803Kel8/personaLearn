import { useRef, useState } from 'react'
import { MdErrorOutline, MdOutlineCameraAlt, MdOutlineDelete, MdOutlineImage } from 'react-icons/md'
import { Avatar } from '@/components/pelajar/Avatar'
import { inputClass, FormField } from '@/components/pelajar/FormField'
import { BottomSheet } from '@/components/pelajar/BottomSheet'
import { ProfileLayout } from '@/components/pelajar/ProfileLayout'
import { Button } from '@/components/pelajar/Button'
import { penggunaAktif, useDb } from '@/data/db'
import { KELOMPOK_MBTI, URL_TES_MBTI } from '@/data/mbti'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

export function MbtiSelect({ value, onChange }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, 'appearance-none pr-12')} aria-label="Tipe Kepribadian (MBTI)">
        <option value="">Belum diisi</option>
        {KELOMPOK_MBTI.map((k) => (
          <optgroup key={k.id} label={`${k.id} — ${k.keterangan}`}>
            {k.tipe.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 right-5 size-6 -translate-y-1/2 text-[#6E6A7C]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

// UC4-L02 Ubah Profil (+ UC4-L07 Pilih Foto Profil; kondisi B: nama kosong / gagal disimpan)
export function UbahProfilPage() {
  const { navigate } = useRouter()
  const { db, aksi } = useDb()
  const u = penggunaAktif(db)
  const [nama, setNama] = useState(u?.nama ?? '')
  const [foto, setFoto] = useState(u?.foto ?? null)
  const [tipe, setTipe] = useState(u?.tipeMbti ?? '')
  const [err, setErr] = useState('')
  const [gagal, setGagal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pilihFoto, setPilihFoto] = useState(false)
  const kamera = useRef(null)
  const galeri = useRef(null)
  const tutup = () => navigate('/profil', { replace: true })

  function bacaFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => setFoto(r.result)
    r.readAsDataURL(f)
    setPilihFoto(false)
  }

  async function simpan() {
    setErr('')
    setGagal(false)
    setLoading(true)
    try {
      const r = await aksi.simpanProfil({ nama, foto, tipeMbti: tipe })
      if (!r.ok) return setErr(r.pesan)
      navigate('/profil/ubah/berhasil', { replace: true })
    } catch {
      setGagal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProfileLayout kode="UC4-L02">
      <BottomSheet open={!pilihFoto} onClose={tutup} title="Ubah Profil">
        <div className="space-y-5">
          {foto !== (u?.foto ?? null) && (
            <div className="flex items-center gap-3 rounded-xl bg-[#F5F1FF] p-3 text-sm text-[#5F33E1]">
              <Avatar u={{ ...u, foto }} className="size-12 text-base" /> Foto baru siap disimpan
            </div>
          )}
          <FormField label="Nama" error={err}>
            <input value={nama} placeholder="Masukkan nama Anda" onChange={(e) => setNama(e.target.value)} className={inputClass} aria-invalid={!!err} />
          </FormField>
          <FormField label="Tipe Kepribadian (MBTI)">
            <MbtiSelect value={tipe} onChange={setTipe} />
          </FormField>
          <a href={URL_TES_MBTI} target="_blank" rel="noreferrer" className="block text-sm text-[#5F33E1]">
            Belum tahu tipe MBTI-mu? Cek di 16personalities
          </a>
          <Button variant="outline" className="w-full" onClick={() => setPilihFoto(true)}>
            Ubah Foto Profil
          </Button>
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

      <input ref={kamera} type="file" accept="image/*" capture="user" hidden onChange={bacaFile} />
      <input ref={galeri} type="file" accept="image/*" hidden onChange={bacaFile} />
      <BottomSheet open={pilihFoto} onClose={() => setPilihFoto(false)} title="Ubah Foto Profil" kode="UC4-L07">
        <div className="space-y-3">
          {[
            { label: 'Ambil Foto', icon: MdOutlineCameraAlt, onClick: () => kamera.current?.click() },
            { label: 'Pilih dari Galeri', icon: MdOutlineImage, onClick: () => galeri.current?.click() },
            {
              label: 'Hapus Foto',
              icon: MdOutlineDelete,
              bahaya: true,
              onClick: () => {
                setFoto(null)
                setPilihFoto(false)
              },
            },
          ].map(({ label, icon: Icon, onClick, bahaya }) => (
            <button key={label} type="button" onClick={onClick} className={cn('flex w-full items-center gap-4 rounded-xl bg-[#F7F5FF] px-5 py-4 text-left text-base', bahaya ? 'text-[#E5484D]' : 'text-[#24252C]')}>
              <Icon className={cn('size-7', bahaya ? 'text-[#E5484D]' : 'text-[#5F33E1]')} />
              {label}
            </button>
          ))}
          <Button variant="outline" className="w-full" onClick={() => setPilihFoto(false)}>
            Batal
          </Button>
        </div>
      </BottomSheet>
    </ProfileLayout>
  )
}
