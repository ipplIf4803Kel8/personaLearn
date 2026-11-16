import { describe, expect, it } from 'vitest'
import { layakKirimPosisi, youtubeId } from '@/hooks/useYouTubePlayer'

describe('youtubeId', () => {
  it('membaca id dari berbagai bentuk tautan', () => {
    expect(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeId('https://m.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('mengembalikan null untuk tautan lain atau tidak valid', () => {
    expect(youtubeId('https://example.com/video.mp4')).toBeNull()
    expect(youtubeId('https://www.youtube.com/watch')).toBeNull()
    expect(youtubeId('bukan url')).toBeNull()
    expect(youtubeId(null)).toBeNull()
  })
})

describe('layakKirimPosisi', () => {
  const dasar = { detik: 40, terakhirDetik: 20, terakhirWaktu: 1000 }
  it('tidak mengirim posisi 0 atau yang sama dengan terakhir terkirim', () => {
    expect(layakKirimPosisi({ ...dasar, detik: 0, sekarang: 99999, paksa: true })).toBe(false)
    expect(layakKirimPosisi({ ...dasar, detik: 20, sekarang: 99999, paksa: true })).toBe(false)
  })
  it('throttle 15 detik tanpa paksa', () => {
    expect(layakKirimPosisi({ ...dasar, sekarang: 15999 })).toBe(false)
    expect(layakKirimPosisi({ ...dasar, sekarang: 16000 })).toBe(true)
  })
  it('paksa (jeda, pagehide) melewati throttle', () => {
    expect(layakKirimPosisi({ ...dasar, sekarang: 1001, paksa: true })).toBe(true)
  })
  it('pengiriman pertama selalu lolos bila posisi > 0', () => {
    expect(layakKirimPosisi({ detik: 5, sekarang: 20000 })).toBe(true)
  })
})
