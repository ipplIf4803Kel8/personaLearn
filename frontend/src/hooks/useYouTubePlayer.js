import { useEffect, useRef } from 'react'

export const INTERVAL_SIMPAN_MS = 15000

// Murni: kirim bila posisi > 0 dan berbeda dari yang terakhir terkirim. Tanpa paksa,
// harus sudah lewat `interval` sejak pengiriman terakhir (throttle).
export function layakKirimPosisi({ detik, terakhirDetik = null, terakhirWaktu = 0, sekarang, paksa = false, interval = INTERVAL_SIMPAN_MS }) {
  if (!(detik > 0) || detik === terakhirDetik) return false
  return paksa || sekarang - terakhirWaktu >= interval
}

/**
 * Menyimpan posisi putar: tiap 15 detik selama memutar, saat dijeda, saat pagehide dan saat unmount.
 * Deklarasikan SEBELUM useYouTubePlayer agar cleanup-nya jalan sebelum pemutar dihancurkan.
 * getPosisi() memberi detik saat ini; simpan(detik, { keepalive }) mengirim ke server.
 */
export function useSimpanPosisi({ getPosisi, simpan, aktif }) {
  const fn = useRef({})
  fn.current = { getPosisi, simpan, aktif }
  const state = useRef({ detik: null, waktu: 0, timer: null })

  const kirim = (paksa, keepalive = false) => {
    const { getPosisi: ambil, simpan: kirimKe, aktif: on } = fn.current
    if (!on) return
    const s = state.current
    const detik = Math.floor(ambil() ?? 0)
    const sekarang = Date.now()
    if (!layakKirimPosisi({ detik, terakhirDetik: s.detik, terakhirWaktu: s.waktu, sekarang, paksa })) return
    s.detik = detik
    s.waktu = sekarang
    Promise.resolve(kirimKe(detik, { keepalive })).catch(() => {})
  }
  const henti = () => {
    clearInterval(state.current.timer)
    state.current.timer = null
  }
  const ref = useRef(null)
  ref.current = {
    mulai: () => {
      if (!state.current.timer) state.current.timer = setInterval(() => kirim(false), INTERVAL_SIMPAN_MS)
    },
    jeda: () => {
      henti()
      kirim(true)
    },
  }

  useEffect(() => {
    const saatTutup = () => kirim(true, true)
    window.addEventListener('pagehide', saatTutup)
    return () => {
      window.removeEventListener('pagehide', saatTutup)
      henti()
      kirim(true, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { mulai: () => ref.current.mulai(), jeda: () => ref.current.jeda() }
}

// Mengambil id video dari tautan YouTube (watch, youtu.be, atau embed). Selain itu null.
export function youtubeId(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    let id = null
    if (host === 'youtu.be') id = u.pathname.slice(1)
    else if (host === 'youtube.com' || host === 'm.youtube.com') {
      id = u.pathname.startsWith('/embed/') ? u.pathname.split('/')[2] : u.searchParams.get('v')
    }
    return id && /^[\w-]{6,}$/.test(id) ? id : null
  } catch {
    return null
  }
}

let apiSiap = null

// Memuat skrip IFrame API satu kali untuk seluruh aplikasi.
function muatApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!apiSiap) {
    apiSiap = new Promise((resolve, reject) => {
      const sebelumnya = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        sebelumnya?.()
        resolve(window.YT)
      }
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.onerror = () => {
        apiSiap = null
        s.remove()
        reject(new Error('Pemutar YouTube gagal dimuat'))
      }
      document.head.appendChild(s)
    })
  }
  return apiSiap
}

/**
 * Membuat pemutar YouTube di dalam elemen `ref` yang dikembalikan.
 * onEnded(detik) dipanggil saat video selesai; getPosition() memberi posisi terakhir (detik).
 */
export function useYouTubePlayer(videoId, { start = 0, onEnded, onError, onPlay, onPause } = {}) {
  const ref = useRef(null)
  const player = useRef(null)
  const callback = useRef({})
  callback.current = { onEnded, onError, onPlay, onPause }

  useEffect(() => {
    const kontainer = ref.current
    if (!videoId || !kontainer) return undefined
    let batal = false
    // YT mengganti elemen target dengan iframe, jadi pakai elemen anak sekali pakai
    const target = document.createElement('div')
    kontainer.appendChild(target)
    muatApi()
      .then((YT) => {
        if (batal) return
        player.current = new YT.Player(target, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: { enablejsapi: 1, rel: 0, playsinline: 1, start: Math.floor(start) },
          events: {
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) callback.current.onPlay?.()
              else if (e.data === YT.PlayerState.PAUSED) callback.current.onPause?.()
              if (e.data === YT.PlayerState.ENDED) callback.current.onEnded?.(Math.floor(player.current?.getCurrentTime?.() ?? 0))
            },
            onError: () => callback.current.onError?.(),
          },
        })
      })
      .catch(() => !batal && callback.current.onError?.())
    return () => {
      batal = true
      player.current?.destroy?.()
      player.current = null
      kontainer.replaceChildren()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  return { ref, getPosition: () => Math.floor(player.current?.getCurrentTime?.() ?? 0) }
}
