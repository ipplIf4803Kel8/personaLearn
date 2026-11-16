import { z } from 'zod'

export const MAX_MESSAGE_LENGTH = 1000

const id = (name) => z.number({ error: `${name} tidak valid` }).int(`${name} tidak valid`).positive(`${name} tidak valid`)
const queryId = (name) => z.coerce.number({ error: `${name} tidak valid` }).int(`${name} tidak valid`).positive(`${name} tidak valid`)

export const sendMessageBody = z
  .object({
    content: z
      .string({ error: 'Pesan wajib diisi' })
      .trim()
      .min(1, 'Pesan tidak boleh kosong')
      .max(MAX_MESSAGE_LENGTH, `Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter`),
    lessonId: id('lessonId').nullish(),
  })
  .strict()

export const listMessagesQuery = z
  .object({
    lessonId: queryId('lessonId').optional(),
    limit: queryId('limit').max(50, 'limit maksimal 50').default(20),
    before: queryId('before').optional(),
  })
  .strict()
