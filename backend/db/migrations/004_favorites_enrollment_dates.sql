-- Sesuai DPPL: Favorite(id, userId, courseId), Enrollment(enrolledAt, completedAt)
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE (user_id, course_id)
);

ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
