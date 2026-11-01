import { MdEmojiEvents } from 'react-icons/md'
import { PointsBar, PointsIcon } from '@/components/pelajar/PointsBar'
import { SectionTitle, Screen } from '@/components/pelajar/Screen'
import { ProgressRing } from '@/components/pelajar/Progress'
import { Loading, ErrorState, EmptyState } from '@/components/pelajar/DataState'
import { TextLink, Button } from '@/components/pelajar/Button'
import { HEADING_FONT } from '@/components/pelajar/theme'
import { kategoriDari, kelasDiikutiSaya, penggunaAktif, useDb } from '@/data/db'
import { useAsync } from '@/hooks/useAsync'
import { useRouter } from '@/lib/router'
import { cn } from '@/lib/utils'

// UC3-L01 Daftar Kelas Anda (kondisi E: belum ada kelas, F: gagal memuat)
export function DaftarKelasAndaPage() {
  const { navigate } = useRouter()
  const { db, aksi } = useDb()
  const u = penggunaAktif(db)
  const muat = useAsync(() => aksi.muatRingkasan(), [])
  const kelas = kelasDiikutiSaya(db).filter((k) => k.kelas.status !== 'disembunyikan')
  const terakhir = [...kelas].sort((a, b) => (b.progres < 100) - (a.progres < 100))[0]
  const sudah = (idT) => db.tantanganPengguna.some((t) => t.idPengguna === u?.id && t.idTantangan === idT)

  return (
    <Screen kode="UC3-L01" back title="Daftar Kelas Anda" bell nav>
      <PointsBar />
      {muat.memuat ? (
        <Loading />
      ) : muat.gagal ? (
        <ErrorState title="Progres belajar gagal dimuat" onRetry={muat.ulangi} />
      ) : (
        <>
          <SectionTitle action={kelas.length > 0 && <TextLink onClick={() => navigate('/kelas-anda/semua')}>Lihat Semua</TextLink>} className="mt-5">
            Aktifitas Anda
          </SectionTitle>
          {kelas.length === 0 ? (
            <EmptyState title="Belum ada kelas yang diikuti" desc="Ambil kelas pertama Anda untuk mulai mencatat progres." action={<Button className="py-3" onClick={() => navigate('/cari')}>Cari Kelas</Button>} />
          ) : (
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_28px_rgba(36,37,44,0.08)]">
              <div className="flex items-center gap-5">
                <ProgressRing value={terakhir.progres} size={92} />
                <div className="min-w-0">
                  <p className="text-sm text-[#6E6A7C]">{kategoriDari(db, terakhir.kelas.idKategori)?.nama}</p>
                  <p className={cn('truncate text-lg font-semibold text-[#24252C]', HEADING_FONT)}>{terakhir.kelas.nama}</p>
                  <p className="mt-1 text-sm text-[#24252C]">Lanjutkan Perjalananmu!</p>
                </div>
              </div>
              <Button className="mt-5 w-full rounded-full py-3" onClick={() => navigate(`/belajar/${terakhir.idKelas}`)}>
                Lanjut Belajar
              </Button>
            </div>
          )}

          <button type="button" onClick={() => navigate('/statistik')} className="mt-4 w-full rounded-full bg-[#EEE9FF] py-2.5 text-sm font-medium text-[#5F33E1]">
            Lihat Statistik Belajar
          </button>

          {db.tantangan.length > 0 && (
            <>
              <SectionTitle className="mt-5">Tantangan Minggu Ini!</SectionTitle>
              <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-4">
                {db.tantangan.map((t) => (
                  <div key={t.id} data-testid="card-tantangan" className="w-72 shrink-0 rounded-3xl bg-white p-6 shadow-[0_8px_28px_rgba(36,37,44,0.08)]">
                    <div className="flex items-start justify-between">
                      <span className="flex size-16 items-center justify-center rounded-full bg-[#FFF3E0] text-[#F59E0B]">
                        <MdEmojiEvents className="size-9" />
                      </span>
                      <span className={cn('inline-flex items-center gap-1 text-base font-semibold text-[#2F80ED]', HEADING_FONT)}>
                        {t.hadiahPoin} <PointsIcon className="size-5" />
                      </span>
                    </div>
                    <p className={cn('mt-4 text-lg leading-snug font-semibold text-[#24252C]', HEADING_FONT)}>{t.judul.replace('Tantangan Minggu Ini: ', '')}</p>
                    <p className="mt-2 text-sm text-[#6E6A7C]">Jawab {t.soal.length} soal untuk menyelesaikan misi!</p>
                    {sudah(t.id) ? (
                      <p className="mt-5 rounded-full bg-[#E8F7EE] py-3 text-center font-medium text-[#1E7A46]">Sudah selesai minggu ini</p>
                    ) : (
                      <Button variant="outline" className="mt-5 w-full rounded-full py-3 text-sm" onClick={() => navigate('/tantangan')}>
                        Coba Tantangan!
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Screen>
  )
}
