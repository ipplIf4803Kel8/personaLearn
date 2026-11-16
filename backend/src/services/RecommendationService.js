import { Course } from '../models/Course.js'

// Bobot skor rekomendasi. Ubah di sini saja.
export const WEIGHTS = Object.freeze({ vark: 3, personality: 2, category: 2, rating: 1, popularity: 1 })

// Huruf MBTI yang cocok dengan tag personality kelas.
export const MBTI_TAGS = Object.freeze({ N: 'exploratory', J: 'structured', E: 'collaborative', I: 'self-paced' })

// Tag personality yang cocok untuk satu tipe MBTI: tag sifat dari tiap huruf, ditambah tipe itu sendiri.
export function personalityTagsFor(mbtiType) {
  if (!mbtiType) return []
  const type = mbtiType.toUpperCase()
  return [...type].map((letter) => MBTI_TAGS[letter]).filter(Boolean).concat(type)
}

// Fungsi skor murni (tanpa akses DB) supaya mudah diuji.
// profile: { varkStyle, mbtiType, takenCategoryIds }, maxStudents: pembagi normalisasi popularitas.
export function scoreCourse(course, profile, maxStudents = 0, weights = WEIGHTS) {
  const wantedTags = personalityTagsFor(profile.mbtiType)
  let score = 0
  if (profile.varkStyle && course.varkTags?.includes(profile.varkStyle)) score += weights.vark
  if (course.personalityTags?.some((tag) => wantedTags.includes(tag))) score += weights.personality
  if (profile.takenCategoryIds?.includes(course.categoryId)) score += weights.category
  score += weights.rating * ((course.rating ?? 0) / 5)
  if (maxStudents > 0) score += weights.popularity * ((course.studentsCount ?? 0) / maxStudents)
  return Math.round(score * 100) / 100
}

// Urutkan kelas dari skor tertinggi; seri dipecah oleh jumlah peserta lalu id.
export function rankCourses(courses, profile, weights = WEIGHTS) {
  const maxStudents = Math.max(0, ...courses.map((c) => c.studentsCount ?? 0))
  return courses
    .map((course) => ({ ...course, score: scoreCourse(course, profile, maxStudents, weights) }))
    .sort((a, b) => b.score - a.score || (b.studentsCount ?? 0) - (a.studentsCount ?? 0) || a.id - b.id)
}

export class RecommendationService {
  // Kelas terbit yang belum diambil, diurutkan sesuai profil pelajar.
  // Tanpa preferensi (MBTI dan VARK kosong) hasilnya kelas populer.
  async recommend(userId, limit = 10) {
    const preference = await Course.preferenceOf(userId)
    if (!preference?.mbtiType && !preference?.varkStyle) return this.popularFor(userId, limit)
    const [{ courses }, takenCategoryIds] = await Promise.all([
      Course.search(userId, { notEnrolled: true }),
      Course.takenCategoryIds(userId),
    ])
    const ranked = rankCourses(courses.map((c) => c.toJSON()), { ...preference, takenCategoryIds })
    return ranked.slice(0, limit)
  }

  async popularFor(userId, limit = 10) {
    const { courses } = await Course.search(userId, { notEnrolled: true, sort: 'popular', limit })
    return courses.map((c) => c.toJSON())
  }
}

export const recommendationService = new RecommendationService()
