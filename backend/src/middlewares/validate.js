// Validasi body, query, dan params dengan skema zod. Hasil yang sudah bersih ada di req.valid.
// Skema sebaiknya dibuat .strict() agar field yang tidak dikenal ditolak.
const hasNul = (v) =>
  typeof v === 'string' ? v.includes('\u0000') : v && typeof v === 'object' ? Object.values(v).some(hasNul) : false
export const NUL_MESSAGE = 'Teks mengandung karakter tidak valid'

export const validate = (schemas) => (req, res, next) => {
  const errors = {}
  const valid = {}
  for (const part of ['body', 'query', 'params']) {
    if (!schemas[part]) continue
    if (hasNul(req[part])) {
      errors[part] ??= NUL_MESSAGE
      continue
    }
    const result = schemas[part].safeParse(req[part] ?? {})
    if (result.success) valid[part] = result.data
    else for (const issue of result.error.issues) errors[issue.path.join('.') || part] ??= issue.message
  }
  if (Object.keys(errors).length) {
    return res.status(422).json({ message: Object.values(errors)[0], errors })
  }
  req.valid = valid
  next()
}
