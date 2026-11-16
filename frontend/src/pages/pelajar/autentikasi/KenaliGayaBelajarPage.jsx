import { useState } from 'react'
import { MdCheck, MdOpenInNew } from 'react-icons/md'
import { Screen } from '@/components/pelajar/Screen'
import { Button } from '@/components/pelajar/Button'
import { useAuth } from '@/context/AuthContext'
import { KELOMPOK_MBTI, URL_TES_MBTI } from '@/data/mbti'
import { api } from '@/lib/api'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

const VARK = [
  { value: 'visual', label: 'Visual', desc: 'Lewat gambar, diagram, dan video' },
  { value: 'auditory', label: 'Auditori', desc: 'Lewat mendengarkan dan berdiskusi' },
  { value: 'reading', label: 'Membaca', desc: 'Lewat teks dan catatan' },
  { value: 'kinesthetic', label: 'Praktik', desc: 'Lewat mencoba langsung' },
]

// UC1-L12 Kenali Gaya Belajarmu: MBTI (boleh "belum tahu") dan gaya belajar VARK.
// Halaman yang sama dipakai untuk mengubah preferensi dari Profil.
export function KenaliGayaBelajarPage() {
  const { navigate } = useRouter()
  const { user, updateUser } = useAuth()
  const sudahIsi = Boolean(user.varkStyle)
  const [mbti, setMbti] = useState(user.mbtiType ?? null)
  const [vark, setVark] = useState(user.varkStyle ?? null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function simpan() {
    if (!vark) return setErr('Pilih gaya belajar yang paling sesuai')
    setErr('')
    setLoading(true)
    try {
      const { data } = await api('/me/preferences', { method: 'PUT', body: { mbtiType: mbti, varkStyle: vark } })
      updateUser(data)
      navigate(sudahIsi ? '/profil' : '/beranda', { replace: true })
    } catch (e) {
      setLoading(false)
      setErr(e.message)
    }
  }

  return (
    <Screen kode="UC1-L12" header={sudahIsi} back={sudahIsi ? '/profil' : undefined} title={sudahIsi ? 'Gaya Belajar' : undefined}>
      <div className={sudahIsi ? 'pt-2 pb-2' : 'pt-10 pb-2'}>
        {!sudahIsi && <h1 className="text-3xl font-bold text-[#5F33E1] font-['Poppins']">Kenali Gaya Belajarmu</h1>}
        <p className="mt-3 text-[#6E6A7C]">Jawabanmu dipakai untuk memilihkan kelas yang paling cocok. Bisa diubah lagi dari Profil.</p>
      </div>

      <h2 className="mt-5 font-bold text-[#24252C]">Tipe MBTI</h2>
      <div className="mt-3 space-y-3">
        {KELOMPOK_MBTI.map((k) => (
          <section
            key={k.id}
            data-testid={`kelompok-${k.id}`}
            className={cn('rounded-3xl p-4 ring-2 transition', k.tipe.includes(mbti) ? 'bg-[#F5F1FF] ring-[#5F33E1]' : 'bg-white shadow-[0_6px_20px_rgba(36,37,44,0.06)] ring-transparent')}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-bold text-[#24252C]">{k.id}</h3>
              <span className="text-xs text-slate-500">{k.keterangan}</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {k.tipe.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={mbti === t}
                  onClick={() => setMbti(t)}
                  className={cn(
                    'flex items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-bold transition',
                    mbti === t ? 'bg-[#5F33E1] text-white shadow-md shadow-violet-300' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#5F33E1]',
                  )}
                >
                  {mbti === t && <MdCheck />}
                  {t}
                </button>
              ))}
            </div>
          </section>
        ))}
        <button
          type="button"
          aria-pressed={mbti === null}
          onClick={() => setMbti(null)}
          className={cn('w-full rounded-2xl py-3 text-sm font-bold ring-2 transition', mbti === null ? 'bg-[#F5F1FF] text-[#5F33E1] ring-[#5F33E1]' : 'bg-white text-slate-600 ring-slate-200')}
        >
          Belum tahu
        </button>
      </div>
      <a href={URL_TES_MBTI} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-[#5F33E1]">
        Belum tahu tipemu? Tes di 16personalities <MdOpenInNew />
      </a>

      <h2 className="mt-7 font-bold text-[#24252C]">Cara belajar yang paling nyaman</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {VARK.map((v) => (
          <button
            key={v.value}
            type="button"
            aria-pressed={vark === v.value}
            onClick={() => setVark(v.value)}
            className={cn('rounded-2xl p-4 text-left ring-2 transition', vark === v.value ? 'bg-[#F5F1FF] ring-[#5F33E1]' : 'bg-white shadow-[0_6px_20px_rgba(36,37,44,0.06)] ring-transparent')}
          >
            <span className="block font-bold text-[#24252C]">{v.label}</span>
            <span className="mt-1 block text-xs text-slate-500">{v.desc}</span>
          </button>
        ))}
      </div>

      {err && (
        <p role="alert" className="mt-4 text-sm font-medium text-rose-600">
          {err}
        </p>
      )}
      <Button className="mt-5 w-full" loading={loading} onClick={simpan}>
        Simpan
      </Button>
    </Screen>
  )
}
