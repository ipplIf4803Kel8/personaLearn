import { describe, expect, it, vi } from 'vitest'
import { aktivitasKeCsv, aktivitasPerHari, formatDurasi, formatNomor, galatTidakDitemukan, idValid, jikaAda, formatRibu, youtubeEmbed } from '@/lib/learning'

describe('format angka', () => {
  it('formatNomor dan formatRibu', () => {
    expect(formatNomor(4)).toBe('04')
    expect(formatNomor(20)).toBe('20')
    expect(formatRibu(950)).toBe('950')
    expect(formatRibu(1250)).toBe('1.3k')
    expect(formatRibu(12000)).toBe('12k')
  })
  it('formatDurasi tidak membulatkan', () => {
    expect(formatDurasi(420)).toBe('7 mnt')
    expect(formatDurasi(425)).toBe('7 mnt 5 dtk')
    expect(formatDurasi(45)).toBe('45 dtk')
    expect(formatDurasi(0)).toBe('0 dtk')
    expect(formatDurasi(undefined)).toBe('0 dtk')
    expect(formatDurasi(3900)).toBe('1 j 5 mnt')
    expect(formatDurasi(7200)).toBe('2 j')
  })
})

describe('galat tidak ditemukan', () => {
  it('idValid dan galatTidakDitemukan', () => {
    expect(['1', 12, '99999'].every(idValid)).toBe(true)
    expect(['abc', 'NaN', '0', '-1', '1.5', ''].some(idValid)).toBe(false)
    expect(galatTidakDitemukan(new Error('Kelas tidak ditemukan'))).toBe(true)
    expect(galatTidakDitemukan(new Error('Tidak dapat terhubung ke server'))).toBe(false)
    expect(galatTidakDitemukan(new Error('Sesi tidak valid, silakan masuk kembali'))).toBe(false)
  })
  it('jikaAda: id buruk tanpa panggilan, 404 jadi null, galat lain dilempar', async () => {
    const fn = vi.fn(async () => 'ok')
    expect(await jikaAda('abc', fn)).toBeNull()
    expect(fn).not.toHaveBeenCalled()
    expect(await jikaAda('3', fn)).toBe('ok')
    expect(await jikaAda('3', async () => { throw new Error('Kelas tidak ditemukan') })).toBeNull()
    await expect(jikaAda('3', async () => { throw new Error('Terjadi kesalahan pada server') })).rejects.toThrow()
  })
})

describe('youtubeEmbed', () => {
  it('mengenali tiga bentuk tautan YouTube', () => {
    const embed = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    expect(youtubeEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(embed)
    expect(youtubeEmbed('https://youtu.be/dQw4w9WgXcQ')).toBe(embed)
    expect(youtubeEmbed(embed)).toBe(embed)
  })
  it('mengabaikan file video dan tautan tidak valid', () => {
    expect(youtubeEmbed('https://cdn.contoh.id/materi.mp4')).toBeNull()
    expect(youtubeEmbed('bukan url')).toBeNull()
    expect(youtubeEmbed('')).toBeNull()
  })
})

describe('aktivitas', () => {
  const sekarang = new Date(2026, 2, 10)
  const activity = [{ date: '2026-03-10', lessons: 2, seconds: 600 }, { date: '2026-03-08', lessons: 1, seconds: 90 }]
  it('mengisi hari kosong dan berurut dari yang terlama', () => {
    const hari = aktivitasPerHari(activity, 4, sekarang)
    expect(hari.map((h) => h.date)).toEqual(['2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10'])
    expect(hari.map((h) => h.lessons)).toEqual([0, 1, 0, 2])
    expect(hari[3].menit).toBe(10)
  })
  it('CSV hanya memuat hari yang ada aktivitasnya', () => {
    expect(aktivitasKeCsv(aktivitasPerHari(activity, 4, sekarang))).toBe('tanggal,pelajaran_selesai,menit\n2026-03-08,1,2\n2026-03-10,2,10')
  })
})
