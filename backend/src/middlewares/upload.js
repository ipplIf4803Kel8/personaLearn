import multer from 'multer'

// Disimpan di memori dulu (maks 2 MB); jenis file diperiksa di UserProfileService
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1 } })

export const uploadAvatar = (req, res, next) =>
  upload.single('avatar')(req, res, (err) => {
    if (!err) return next()
    const tooBig = err.code === 'LIMIT_FILE_SIZE'
    const message = tooBig ? 'Ukuran foto maksimal 2 MB' : 'Foto tidak valid'
    res.status(tooBig ? 413 : 422).json({ message, errors: { avatar: message } })
  })
