import { ChallengeService } from '../services/ChallengeService.js'
import { ProgressService } from '../services/ProgressService.js'

const progress = new ProgressService()
const challenges = new ChallengeService()

const ok = (res, data, message = 'Berhasil') => res.json({ data, message })

export const listEnrollments = async (req, res) =>
  ok(res, await progress.listEnrollments(req.user.sub), 'Daftar kelas yang diambil')

export const getEnrollment = async (req, res) =>
  ok(res, await progress.getEnrollment(req.user.sub, req.valid.params.courseId), 'Progres kelas')

export const getLesson = async (req, res) =>
  ok(res, await progress.getLesson(req.user.sub, req.valid.params.id), 'Detail pelajaran')

export const completeLesson = async (req, res) => {
  const data = await progress.completeLesson(req.user.sub, req.valid.params.id, req.valid.body)
  ok(res, data, data.alreadyCompleted ? 'Pelajaran ini sudah selesai' : 'Pelajaran ditandai selesai')
}

export const savePosition = async (req, res) =>
  ok(res, await progress.savePosition(req.user.sub, req.valid.params.id, req.valid.body.positionSeconds), 'Posisi video disimpan')

export const setReaction = async (req, res) =>
  ok(res, await progress.setReaction(req.user.sub, req.valid.params.id, req.valid.body.reaction), 'Reaksi disimpan')

export const getStats = async (req, res) => ok(res, await progress.getStats(req.user.sub), 'Statistik belajar')

export const activeChallenges = async (req, res) =>
  ok(res, await challenges.listActive(req.user.sub), 'Tantangan minggu ini')

export const completeChallenge = async (req, res) =>
  ok(res, await challenges.complete(req.user.sub, req.valid.params.id), 'Tantangan selesai')
