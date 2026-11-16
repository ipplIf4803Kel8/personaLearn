import pool from '../config/db.js'
import { Challenge } from '../models/Challenge.js'
import { notifyUser } from '../utils/notifyUser.js'
import { PointService } from './PointService.js'
import { StreakService } from './StreakService.js'

const fail = (status, message) => Object.assign(new Error(message), { status })

export class ChallengeService {
  #db

  constructor(db = pool) {
    this.#db = db
  }

  listActive(userId, today = StreakService.today()) {
    return Challenge.listActive(userId, today, this.#db)
  }

  async complete(userId, challengeId, today = StreakService.today()) {
    const challenge = await Challenge.findById(challengeId, this.#db)
    if (!challenge) throw fail(404, 'Tantangan tidak ditemukan')
    if (!challenge.isActiveOn(today)) throw fail(400, 'Tantangan ini tidak sedang berlangsung')

    const client = await this.#db.connect()
    let pointsEarned
    try {
      await client.query('BEGIN')
      if (!(await Challenge.markCompleted(userId, challengeId, client))) throw fail(409, 'Tantangan sudah Anda selesaikan')
      pointsEarned = await new PointService(client).award(userId, 'challenge', challengeId, challenge.rewardPoints)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {})
      throw err
    } finally {
      client.release()
    }

    await notifyUser(userId, {
      type: 'challenge',
      title: 'Tantangan selesai',
      body: `Kamu menyelesaikan tantangan ${challenge.title} dan mendapat ${pointsEarned} poin.`,
    })
    return { challengeId, pointsEarned, totalPoints: await new PointService(this.#db).total(userId) }
  }
}
