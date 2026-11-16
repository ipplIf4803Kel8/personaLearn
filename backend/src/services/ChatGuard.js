import { PROMPT_MARKERS } from './ChatPromptBuilder.js'

export const FALLBACK_REPLY = 'Maaf, Sinau Bot sedang tidak bisa menjawab saat ini. Silakan coba lagi beberapa saat lagi.'
export const REFUSAL_REPLY =
  'Maaf, Sinau Bot tidak bisa membantu permintaan itu. Aku di sini untuk membantumu belajar, jadi coba tanyakan tentang materi atau kelasmu ya.'
export const UNSAFE_REPLY = 'Maaf, Sinau Bot tidak bisa menampilkan jawaban itu. Coba tanyakan dengan cara lain seputar materi belajarmu.'

export const MAX_REPLY_CHARS = 2000

// Pola upaya jelas mengeksploitasi bot. Satu tempat; sengaja sempit agar pertanyaan belajar sah
// (mis. "apa itu prompt injection?") tetap lolos ke LLM.
const VERBS_REVEAL = '(?:tampilkan|tunjukkan|perlihatkan|bocorkan|ungkap(?:kan)?|sebutkan|ulangi|tulis(?:kan)?|cetak|show|reveal|print|repeat|display|leak|output|dump)'
const PROMPT_NOUN =
  '(?:system\\s*prompt|prompt\\s+(?:sistem|awal|rahasia|kamu|mu|anda)|instruksi\\s+(?:sistem|internal|awal|rahasia|kamu|mu)|aturan\\s+(?:internal|rahasiamu)|(?:your|the)\\s+(?:system\\s+)?(?:prompt|instructions|rules))'
export const EXPLOIT_PATTERNS = [
  /\b(?:abaikan|lupakan|kesampingkan|ignore|disregard|forget|override)\s+(?:semua\s+|seluruh\s+|all\s+|any\s+|your\s+|the\s+|previous\s+|prior\s+|above\s+|earlier\s+)*(?:instruksi|perintah|aturan|petunjuk|instructions?|rules?|prompts?|guidelines?|restrictions?)/i,
  new RegExp(`${VERBS_REVEAL}\\W+(?:\\w+\\W+){0,4}?${PROMPT_NOUN}`, 'i'),
  /\b(?:developer|god|jailbreak)\s+mode\b|\bmode\s+(?:pengembang|developer|dewa)\b/i,
  /\b(?:kamu|anda|you)\s+(?:sekarang\s+|are\s+now\s+|now\s+)?(?:adalah\s+|jadi\s+|bertindak\s+sebagai\s+)?DAN\b/,
  /\bdo\s+anything\s+now\b/i,
  /\b(?:kamu|anda)\s+(?:sekarang\s+)?(?:tanpa|bebas\s+dari)\s+(?:aturan|batasan|filter|sensor)/i,
  /\bpretend\s+(?:you\s+(?:have|are)\s+)?(?:no|without)\s+(?:rules|restrictions|filters)/i,
]

export const isExploitAttempt = (text) => EXPLOIT_PATTERNS.some((p) => p.test(text))

// Sanitasi input pelajar: buang karakter kontrol/NUL dan karakter format tak terlihat, normalisasi spasi.
export const sanitizeInput = (text) =>
  String(text ?? '')
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f​-‏‪-‮⁠-⁤﻿]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

// Tolak pesan tanpa huruf/angka atau berisi satu karakter yang diulang ekstrem.
export const isMeaningless = (text) => {
  if (!/[\p{L}\p{N}]/u.test(text)) return true
  return /(.)\1{39,}/su.test(text)
}

const KEY_PATTERN = /AIza[0-9A-Za-z_-]{20,}/
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g
const PHONE_PATTERN = /(?<![\w.])(?:\+62|62|0)8\d[\d\s-]{7,12}\d(?!\d)/g

const truncate = (text) => {
  if (text.length <= MAX_REPLY_CHARS) return text
  const cut = text.slice(0, MAX_REPLY_CHARS)
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('\n'), cut.lastIndexOf('? '))
  return end > MAX_REPLY_CHARS / 2 ? cut.slice(0, end + 1) : `${cut.trimEnd()}...`
}

// Filter balasan: buang HTML/skrip, ganti seluruh balasan bila memuat kunci atau potongan system prompt,
// sembunyikan email dan nomor telepon, lalu potong dengan aman.
export const filterReply = (reply) => {
  const text = String(reply ?? '')
    .replace(/<(script|style|iframe)[\s\S]*?(<\/\1\s*>|$)/gi, '')
    .replace(/<\/?[a-z!][^>]*>?/gi, '')
    .trim()
  const lower = text.toLowerCase()
  if (KEY_PATTERN.test(text) || PROMPT_MARKERS.some((m) => lower.includes(m.toLowerCase()))) return UNSAFE_REPLY
  const safe = truncate(text.replace(EMAIL_PATTERN, '[disembunyikan]').replace(PHONE_PATTERN, '[disembunyikan]')).trim()
  return safe || FALLBACK_REPLY
}
