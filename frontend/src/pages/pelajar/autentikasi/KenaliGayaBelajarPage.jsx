import { useState } from 'react'
import { MdCheck, MdOpenInNew } from 'react-icons/md'
import { Screen } from '@/components/pelajar/Screen'
import { Button } from '@/components/pelajar/Button'
import { penggunaAktif, useDb } from '@/data/db'
import { KELOMPOK_MBTI, URL_TES_MBTI } from '@/data/mbti'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC1-L12 Kenali Gaya Belajarmu (login pertama Pelajar; alur F Lewati, alur G 16personalities)
export function KenaliGayaBelajarPage() {
  const { navigate } = useRouter()
  const { db, aksi } = useDb()
  const u = penggunaAktif(db)
  const [tipe, setTipe] = useState(u?.tipeMbti ?? null)
  const [loading, setLoading] = useState(false)
  async function selesai(nilai) {
    setLoading(true)
    await aksi.simpanTipeMbtiAwal(nilai)
    navigate('/beranda', { replace: true })
  }
  return (
    <Screen kode="UC1-L12" header={false}>
      <div className="pt-10 pb-2">
        <h1 className="text-3xl font-bold text-[#5F33E1] font-['Poppins']">Kenali Gaya Belajarmu</h1>
        <p className="mt-3 text-[#6E6A7C]">Pilih tipe MBTI-mu agar rekomendasi kelas lebih pas.</p>
      </div>
      <div className="mt-5 space-y-3">
        {KELOMPOK_MBTI.map((k) => {
          const tersorot = k.tipe.includes(tipe)
          return (
            <section
              key={k.id}
              data-testid={`kelompok-${k.id}`}
              className={cn('rounded-3xl p-4 ring-2 transition', tersorot ? 'bg-[#F5F1FF] ring-[#5F33E1]' : 'bg-white shadow-[0_6px_20px_rgba(36,37,44,0.06)] ring-transparent')}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-bold text-[#24252C]">{k.id}</h2>
                <span className="text-xs text-slate-500">{k.keterangan}</span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {k.tipe.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tipe === t}
                    onClick={() => setTipe(t)}
                    className={cn(
                      'flex items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-bold transition',
                      tipe === t ? 'bg-[#5F33E1] text-white shadow-md shadow-violet-300' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#5F33E1]',
                    )}
                  >
                    {tipe === t && <MdCheck />}
                    {t}
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </div>
      <a
        href={URL_TES_MBTI}
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex items-center justify-center gap-1 text-sm font-semibold text-[#5F33E1]"
      >
        Belum tahu tipemu? Tes di 16personalities <MdOpenInNew />
      </a>
      <Button className="mt-5 w-full" disabled={!tipe} loading={loading} onClick={() => selesai(tipe)}>
        Simpan
      </Button>
      <Button variant="ghost" className="mt-1 w-full" disabled={loading} onClick={() => selesai(null)}>
        Lewati, isi nanti di Profil
      </Button>
    </Screen>
  )
}
