import { Challenge } from '../models/Challenge.js'
import { HttpError } from '../utils/httpError.js'

const NOT_FOUND = 'Tantangan tidak ditemukan'

export class AdminChallengeService {
  list() {
    return Challenge.listAdmin()
  }

  create(data) {
    return Challenge.insert(data)
  }

  async update(id, data) {
    const challenge = await Challenge.update(id, data)
    if (!challenge) throw new HttpError(404, NOT_FOUND)
    return challenge
  }

  async delete(id) {
    if (!(await Challenge.delete(id))) throw new HttpError(404, NOT_FOUND)
  }
}

export const adminChallengeService = new AdminChallengeService()
