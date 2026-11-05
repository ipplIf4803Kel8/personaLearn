// Token warna & huruf diambil dari desain Figma (APPL).
export const PRIMARY_COLOR = '#5F33E1'

export const HEADING_FONT = "font-['Poppins',ui-sans-serif,system-ui]" // huruf judul

export const BODY_FONT = "font-['DM_Sans',ui-sans-serif,system-ui]" // huruf isi

/** Format menit seperti di Figma: "6j 30mnt" atau "45 mnt". */
export function formatDuration(menit) {
  const m = Math.round(Number(menit) || 0)
  if (m < 60) return `${m} mnt`
  return `${Math.floor(m / 60)}j ${m % 60}mnt`
}
