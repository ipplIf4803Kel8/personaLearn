-- Membawa skema 002-004 ke skema target 3NF (lihat db/queries.sql untuk contoh query).
-- Ringkasan keputusan:
-- * Preferensi belajar dipisah dari users (learning_preferences), tanpa Big Five.
-- * Tag kelas jadi baris di course_tags, bukan array di courses.
-- * Rating pindah ke course_ratings; rating rata-rata dan jumlah peserta dihitung di view course_stats.
-- * Progres belajar tidak disimpan; dihitung dari lesson_progress lewat view enrollment_progress.
-- * Notifikasi per pengguna di notifications; riwayat kiriman admin di notification_broadcasts,
--   dan tiap baris notifications boleh menunjuk broadcast asalnya lewat broadcast_id.

DROP TABLE IF EXISTS app_info;

-- Fungsi pengisi updated_at, dipasang ke semua tabel di bagian akhir
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabel baru

CREATE TABLE IF NOT EXISTS learning_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  mbti_type VARCHAR(4) CHECK (mbti_type ~ '^[EI][SN][TF][JP]$'),
  vark_style VARCHAR(10) CHECK (vark_style IN ('visual', 'auditory', 'reading', 'kinesthetic'))
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mbti_type') THEN
    INSERT INTO learning_preferences (user_id, mbti_type, vark_style)
    SELECT id,
      CASE WHEN mbti_type ~ '^[EI][SN][TF][JP]$' THEN mbti_type END,
      CASE WHEN vark_style IN ('visual', 'auditory', 'reading', 'kinesthetic') THEN vark_style END
    FROM users
    WHERE mbti_type IS NOT NULL OR vark_style IS NOT NULL
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;

ALTER TABLE users DROP COLUMN IF EXISTS mbti_type;
ALTER TABLE users DROP COLUMN IF EXISTS vark_style;

CREATE TABLE IF NOT EXISTS course_tags (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tag_type VARCHAR(12) NOT NULL CHECK (tag_type IN ('vark', 'personality')),
  tag_value VARCHAR(30) NOT NULL,
  UNIQUE (course_id, tag_type, tag_value),
  CHECK (tag_type <> 'vark' OR tag_value IN ('visual', 'auditory', 'reading', 'kinesthetic'))
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'vark_tags') THEN
    INSERT INTO course_tags (course_id, tag_type, tag_value)
    SELECT id, 'vark', t FROM courses, unnest(vark_tags) AS t
    WHERE t IN ('visual', 'auditory', 'reading', 'kinesthetic')
    ON CONFLICT DO NOTHING;
    INSERT INTO course_tags (course_id, tag_type, tag_value)
    SELECT id, 'personality', t FROM courses, unnest(personality_tags) AS t
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

ALTER TABLE courses DROP COLUMN IF EXISTS vark_tags;
ALTER TABLE courses DROP COLUMN IF EXISTS personality_tags;

CREATE TABLE IF NOT EXISTS course_ratings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  UNIQUE (user_id, course_id)
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'rating') THEN
    INSERT INTO course_ratings (user_id, course_id, rating)
    SELECT user_id, course_id, rating FROM enrollments WHERE rating IS NOT NULL
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

ALTER TABLE enrollments DROP COLUMN IF EXISTS rating;
ALTER TABLE enrollments DROP COLUMN IF EXISTS progress_percent;

-- id surrogate untuk tabel dengan primary key gabungan
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'id') THEN
    ALTER TABLE enrollments DROP CONSTRAINT enrollments_pkey;
    ALTER TABLE enrollments ADD COLUMN id SERIAL PRIMARY KEY;
    ALTER TABLE enrollments ADD CONSTRAINT enrollments_user_course_key UNIQUE (user_id, course_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lesson_progress' AND column_name = 'id') THEN
    ALTER TABLE lesson_progress DROP CONSTRAINT lesson_progress_pkey;
    ALTER TABLE lesson_progress ADD COLUMN id SERIAL PRIMARY KEY;
    ALTER TABLE lesson_progress ADD CONSTRAINT lesson_progress_user_lesson_key UNIQUE (user_id, lesson_id);
  END IF;
END $$;

-- completed_at kosong berarti pelajaran baru dibuka tapi belum selesai
ALTER TABLE lesson_progress ALTER COLUMN completed_at DROP NOT NULL;
ALTER TABLE lesson_progress ALTER COLUMN completed_at DROP DEFAULT;
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS last_position_seconds INT NOT NULL DEFAULT 0 CHECK (last_position_seconds >= 0);

CREATE TABLE IF NOT EXISTS lesson_reactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  reaction VARCHAR(10) NOT NULL CHECK (reaction IN ('like', 'dislike')),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS challenge_completions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, challenge_id)
);

-- reference_id menunjuk lessons.id atau challenges.id sesuai source (null untuk streak)
CREATE TABLE IF NOT EXISTS point_transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INT NOT NULL,
  source VARCHAR(10) NOT NULL CHECK (source IN ('lesson', 'challenge', 'streak')),
  reference_id INT
);

CREATE TABLE IF NOT EXISTS user_streaks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INT NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE
);

CREATE TABLE IF NOT EXISTS notification_settings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_time TIME NOT NULL DEFAULT '19:00',
  frequency VARCHAR(10) NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  allow_promo BOOLEAN NOT NULL DEFAULT TRUE,
  allow_challenge BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  attempts INT NOT NULL DEFAULT 0
);

-- Notifikasi: tabel lama adalah riwayat kiriman admin, jadi dipindah ke notification_broadcasts
CREATE TABLE IF NOT EXISTS notification_broadcasts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  audience VARCHAR(100) NOT NULL DEFAULT 'Semua Pelajar',
  sent_at TIMESTAMP NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'audience') THEN
    INSERT INTO notification_broadcasts (title, body, audience, sent_at)
    SELECT title, body, audience, sent_at FROM notifications;
    DROP TABLE notifications;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  broadcast_id INT REFERENCES notification_broadcasts(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL DEFAULT 'info',
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- chat_messages: user_id wajib, tambah lesson_id dan sender, message jadi content
DELETE FROM chat_messages WHERE user_id IS NULL;
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;
ALTER TABLE chat_messages ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'message') THEN
    ALTER TABLE chat_messages RENAME COLUMN message TO content;
  END IF;
END $$;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS lesson_id INT REFERENCES lessons(id) ON DELETE SET NULL;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender VARCHAR(4) NOT NULL DEFAULT 'user' CHECK (sender IN ('user', 'bot'));

-- View agregat (tidak disimpan ganda)

CREATE OR REPLACE VIEW course_stats AS
SELECT c.id AS course_id,
  (SELECT ROUND(AVG(r.rating), 1)::float FROM course_ratings r WHERE r.course_id = c.id) AS rating_avg,
  (SELECT COUNT(*)::int FROM course_ratings r WHERE r.course_id = c.id) AS ratings_count,
  (SELECT COUNT(*)::int FROM enrollments e WHERE e.course_id = c.id) AS students_count
FROM courses c;

CREATE OR REPLACE VIEW enrollment_progress AS
SELECT e.id AS enrollment_id, e.user_id, e.course_id,
  COUNT(l.id)::int AS total_lessons,
  COUNT(lp.completed_at)::int AS completed_lessons,
  CASE WHEN COUNT(l.id) = 0 THEN 0 ELSE ROUND(100.0 * COUNT(lp.completed_at) / COUNT(l.id))::int END AS progress_percent
FROM enrollments e
LEFT JOIN lessons l ON l.course_id = e.course_id
LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = e.user_id
GROUP BY e.id;

-- Index FK yang sering di-query (kolom unik gabungan sudah punya index sendiri)
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_course_tags_course ON course_tags(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id, position);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_ratings_course ON course_ratings(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_reactions_lesson ON lesson_reactions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_favorites_course ON favorites(course_id);
CREATE INDEX IF NOT EXISTS idx_challenges_course ON challenges(course_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_challenge ON challenge_completions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_broadcast ON notifications(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);

-- created_at dan updated_at di semua tabel, updated_at diisi trigger
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'learning_preferences', 'categories', 'courses', 'course_tags', 'lessons', 'enrollments',
    'lesson_progress', 'course_ratings', 'lesson_reactions', 'favorites', 'challenges', 'challenge_completions',
    'point_transactions', 'user_streaks', 'notification_settings', 'notification_broadcasts', 'notifications',
    'chat_messages', 'password_resets'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW()', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW()', t);
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;
