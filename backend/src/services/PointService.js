import pool from '../config/db.js'
import { PointTransaction } from '../models/PointTransaction.js'

export const LESSON_POINTS = 10

export class PointService {
  #db

  constructor(db = pool) {
    this.#db = db
  }

  // Poin pelajaran tetap; poin tantangan mengikuti reward_points tantangan.
  static pointsFor(source, rewardPoints = 0) {
    if (source === 'lesson') return LESSON_POINTS
    if (source === 'challenge') return Math.max(0, Number(rewardPoints) || 0)
    throw new Error(`Sumber poin tidak dikenal: ${source}`)
  }

  async award(userId, source, referenceId, rewardPoints = 0) {
    const points = PointService.pointsFor(source, rewardPoints)
    if (points === 0) return 0
    await PointTransaction.create({ userId, points, source, referenceId }, this.#db)
    return points
  }

  total(userId) {
    return PointTransaction.totalFor(userId, this.#db)
  }
}
