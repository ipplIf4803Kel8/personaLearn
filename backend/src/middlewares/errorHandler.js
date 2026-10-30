export function notFound(req, res) {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' })
}

const pgErrors = {
  23505: [409, 'Data sudah ada'],
  23503: [409, 'Data masih terhubung dengan data lain atau referensi tidak ditemukan'],
  23514: [400, 'Data tidak memenuhi aturan (mis. tanggal berakhir sebelum tanggal mulai)'],
  '22P02': [400, 'Format data tidak valid'],
}

export function errorHandler(err, req, res, next) {
  const [status, message] = pgErrors[err.code] ?? [err.status || 500, err.message || 'Terjadi kesalahan pada server']
  if (status === 500) console.error(err)
  res.status(status).json({ message })
}
