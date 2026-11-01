// Pemetaan tipe MBTI -> kelompok gaya belajar -> tag jenis konten (DPPL UC#6 dan UC#10).
export const KELOMPOK_MBTI = [
  {
    id: 'Analitis',
    keterangan: 'Suka konsep dan teori',
    tag: 'Teoritis',
    tipe: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
    warna: 'bg-violet-50 text-violet-700 ring-violet-200',
  },
  {
    id: 'Praktis',
    keterangan: 'Belajar lewat praktik langsung',
    tag: 'Praktik',
    tipe: ['ISTP', 'ESTP', 'ISFP', 'ESFP'],
    warna: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  {
    id: 'Terstruktur',
    keterangan: 'Suka materi bertahap dan rapi',
    tag: 'Terstruktur',
    tipe: ['ISTJ', 'ESTJ', 'ISFJ', 'ESFJ'],
    warna: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  {
    id: 'Reflektif',
    keterangan: 'Suka diskusi dan refleksi',
    tag: 'Reflektif',
    tipe: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
    warna: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
]

export const SEMUA_TIPE_MBTI = KELOMPOK_MBTI.flatMap((k) => k.tipe)
export const JENIS_TAG = KELOMPOK_MBTI.map((k) => k.tag)
export const TINGKAT_KESULITAN = ['Mudah', 'Sedang', 'Sulit']
export const URL_TES_MBTI = 'https://www.16personalities.com/id/tes-kepribadian'

export function kelompokDariTipe(tipe) {
  if (!tipe) return null
  return KELOMPOK_MBTI.find((k) => k.tipe.includes(tipe.toUpperCase())) ?? null
}
