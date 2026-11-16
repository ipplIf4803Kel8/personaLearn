import { describe, expect, it } from 'vitest'
import { formatFoto, validateFoto } from '@/lib/profilValidation'

const berkas = (bytes, nama = 'f.jpg', type = 'image/jpeg') => new File([new Uint8Array(bytes)], nama, { type })

describe('validateFoto', () => {
  it('mengenali format dari byte awal', () => {
    expect(formatFoto([0xff, 0xd8, 0xff, 0xe0])).toBe('jpeg')
    expect(formatFoto([0x89, 0x50, 0x4e, 0x47])).toBe('png')
    expect(formatFoto([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])).toBe('webp')
    expect(formatFoto([0x47, 0x49, 0x46, 0x38])).toBeNull()
  })
  it('menolak berkas yang hanya menyamar lewat type', async () => {
    expect(await validateFoto(berkas([0x47, 0x49, 0x46, 0x38, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe('Foto harus berformat JPG, PNG, atau WebP')
    expect(await validateFoto(berkas([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe('')
  })
  it('menolak lebih dari 2 MB', async () => {
    const besar = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'b.png', { type: 'image/png' })
    expect(await validateFoto(besar)).toBe('Ukuran foto maksimal 2 MB')
  })
})
