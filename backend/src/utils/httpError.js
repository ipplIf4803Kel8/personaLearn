export class HttpError extends Error {
  constructor(status, message, errors) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

// Bungkus handler agar HttpError yang membawa errors dibalas { message, errors }
export const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res)
  } catch (err) {
    if (err instanceof HttpError && err.errors) {
      return res.status(err.status).json({ message: err.message, errors: err.errors })
    }
    next(err)
  }
}
