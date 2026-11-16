// Unit test RecommendationService: fungsi skor murni, tanpa database.
import assert from 'node:assert/strict'
import { describe, it } from 'vitest'
import { WEIGHTS, personalityTagsFor, rankCourses, scoreCourse } from '../src/services/RecommendationService.js'

const course = (over = {}) => ({
  id: 1,
  categoryId: 1,
  varkTags: [],
  personalityTags: [],
  rating: 0,
  studentsCount: 0,
  ...over,
})

describe('personalityTagsFor', () => {
  it('memetakan huruf MBTI ke tag personality dan menyertakan tipenya', () => {
    assert.deepEqual(personalityTagsFor('entj'), ['collaborative', 'exploratory', 'structured', 'ENTJ'])
    assert.ok(personalityTagsFor('INTP').includes('self-paced'))
    assert.ok(personalityTagsFor('INTP').includes('exploratory'))
    assert.ok(personalityTagsFor('ENFJ').includes('collaborative'))
    assert.ok(personalityTagsFor('ISTJ').includes('structured'))
    assert.ok(personalityTagsFor('INTP').includes('INTP'))
    assert.deepEqual(personalityTagsFor(null), [])
  })
})

describe('scoreCourse', () => {
  const profile = { varkStyle: 'visual', mbtiType: 'INTP', takenCategoryIds: [5] }

  it('VARK sama menambah bobot vark', () => {
    assert.equal(scoreCourse(course({ varkTags: ['visual'] }), profile), WEIGHTS.vark)
    assert.equal(scoreCourse(course({ varkTags: ['auditory'] }), profile), 0)
  })

  it('tag personality cocok MBTI menambah bobot sekali saja', () => {
    assert.equal(scoreCourse(course({ personalityTags: ['exploratory', 'self-paced'] }), profile), WEIGHTS.personality)
    assert.equal(scoreCourse(course({ personalityTags: ['collaborative'] }), profile), 0)
  })

  it('kategori yang sama dengan kelas yang pernah diambil menambah bobot kategori', () => {
    assert.equal(scoreCourse(course({ categoryId: 5 }), profile), WEIGHTS.category)
  })

  it('rating dan popularitas dinormalisasi', () => {
    assert.equal(scoreCourse(course({ rating: 5, studentsCount: 10 }), {}, 10), WEIGHTS.rating + WEIGHTS.popularity)
    assert.equal(scoreCourse(course({ rating: 2.5, studentsCount: 5 }), {}, 10), 1)
    assert.equal(scoreCourse(course({ rating: null, studentsCount: 5 }), {}, 0), 0)
  })

  it('bobot bisa diganti lewat argumen', () => {
    assert.equal(scoreCourse(course({ varkTags: ['visual'] }), profile, 0, { ...WEIGHTS, vark: 10 }), 10)
  })
})

describe('rankCourses', () => {
  const profile = { varkStyle: 'visual', mbtiType: 'ENFP', takenCategoryIds: [] }

  it('urut dari skor tertinggi', () => {
    const ranked = rankCourses(
      [
        course({ id: 1 }),
        course({ id: 2, varkTags: ['visual'], personalityTags: ['ENFP'] }),
        course({ id: 3, varkTags: ['visual'] }),
      ],
      profile
    )
    assert.deepEqual(ranked.map((c) => c.id), [2, 3, 1])
    assert.equal(ranked[0].score, WEIGHTS.vark + WEIGHTS.personality)
  })

  it('skor seri dipecah jumlah peserta lalu id', () => {
    const ranked = rankCourses([course({ id: 1, studentsCount: 1 }), course({ id: 2, studentsCount: 1 }), course({ id: 3, studentsCount: 1 })], {})
    assert.deepEqual(ranked.map((c) => c.id), [1, 2, 3])
  })

  it('daftar kosong tidak error', () => {
    assert.deepEqual(rankCourses([], profile), [])
  })
})
