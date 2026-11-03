import { courseService } from '../services/course.service.js'

// CourseController: lapisan HTTP tipis; logika bisnis ada di CourseService.
export const search = async (req, res) => res.json(await courseService.search(req.user.sub, req.query))
export const detail = async (req, res) => res.json(await courseService.getDetail(req.user.sub, req.params.id))
export const enroll = async (req, res) => res.json(await courseService.enroll(req.user.sub, req.params.id))
export const toggleFavorite = async (req, res) =>
  res.json(await courseService.toggleFavorite(req.user.sub, req.params.id))
