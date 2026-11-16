import { z } from 'zod'

const id = z.coerce.number({ error: 'ID tidak valid' }).int('ID tidak valid').positive('ID tidak valid')

export const idParams = z.object({ id }).strict()
export const courseIdParams = z.object({ courseId: id }).strict()

export const completeLessonBody = z
  .object({ positionSeconds: z.number({ error: 'Posisi video tidak valid' }).int().min(0, 'Posisi video tidak valid').optional() })
  .strict()

export const positionBody = z
  .object({ positionSeconds: z.number({ error: 'Posisi video tidak valid' }).int('Posisi video tidak valid').min(0, 'Posisi video tidak valid') })
  .strict()

// reaction null menghapus reaksi
export const reactionBody = z
  .object({ reaction: z.enum(['like', 'dislike'], { error: 'Reaksi harus like atau dislike' }).nullable() })
  .strict()
