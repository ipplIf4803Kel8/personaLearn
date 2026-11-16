-- Contoh SELECT untuk semua tabel personaLearn.
-- Jalankan lewat psql: psql -d personalearn -f db/queries.sql

-- users
SELECT id, name, email, phone, role, is_active, last_login_at, created_at FROM users ORDER BY id;

-- learning_preferences (preferensi belajar tiap pelajar)
SELECT u.name, lp.mbti_type, lp.vark_style
FROM learning_preferences lp JOIN users u ON u.id = lp.user_id;

-- categories
SELECT id, name, slug FROM categories ORDER BY name;

-- courses (dengan kategori, rating rata-rata, dan jumlah peserta dari view course_stats)
SELECT c.id, c.title, cat.name AS category, c.level, c.is_published, s.rating_avg, s.ratings_count, s.students_count
FROM courses c
JOIN categories cat ON cat.id = c.category_id
JOIN course_stats s ON s.course_id = c.id
ORDER BY s.students_count DESC, c.id;

-- course_tags (tag gaya belajar dan kepribadian per kelas)
SELECT c.title, t.tag_type, t.tag_value
FROM course_tags t JOIN courses c ON c.id = t.course_id
ORDER BY c.title, t.tag_type, t.tag_value;

-- lessons
SELECT c.title AS course, l.position, l.title, l.video_url, l.duration_seconds
FROM lessons l JOIN courses c ON c.id = l.course_id
ORDER BY c.id, l.position;

-- enrollments
SELECT u.name, c.title, e.enrolled_at, e.completed_at
FROM enrollments e JOIN users u ON u.id = e.user_id JOIN courses c ON c.id = e.course_id
ORDER BY e.enrolled_at DESC;

-- enrollment_progress (progres dihitung dari lesson_progress, tidak disimpan)
SELECT u.name, c.title, ep.completed_lessons, ep.total_lessons, ep.progress_percent
FROM enrollment_progress ep JOIN users u ON u.id = ep.user_id JOIN courses c ON c.id = ep.course_id;

-- lesson_progress
SELECT u.name, l.title, lp.completed_at, lp.last_position_seconds
FROM lesson_progress lp JOIN users u ON u.id = lp.user_id JOIN lessons l ON l.id = lp.lesson_id;

-- course_ratings
SELECT u.name, c.title, r.rating, r.review
FROM course_ratings r JOIN users u ON u.id = r.user_id JOIN courses c ON c.id = r.course_id;

-- lesson_reactions (jumlah like dan dislike per pelajaran)
SELECT l.title,
  COUNT(*) FILTER (WHERE r.reaction = 'like') AS likes,
  COUNT(*) FILTER (WHERE r.reaction = 'dislike') AS dislikes
FROM lesson_reactions r JOIN lessons l ON l.id = r.lesson_id
GROUP BY l.id, l.title;

-- favorites
SELECT u.name, c.title
FROM favorites f JOIN users u ON u.id = f.user_id JOIN courses c ON c.id = f.course_id;

-- challenges (yang sedang aktif)
SELECT id, title, reward_points, starts_at, ends_at, course_id
FROM challenges WHERE CURRENT_DATE BETWEEN starts_at AND ends_at ORDER BY ends_at;

-- challenge_completions
SELECT u.name, ch.title, cc.completed_at
FROM challenge_completions cc JOIN users u ON u.id = cc.user_id JOIN challenges ch ON ch.id = cc.challenge_id;

-- point_transactions (total poin per pelajar)
SELECT u.name, SUM(pt.points) AS total_points
FROM point_transactions pt JOIN users u ON u.id = pt.user_id
GROUP BY u.id, u.name ORDER BY total_points DESC;

-- user_streaks
SELECT u.name, s.current_streak, s.longest_streak, s.last_activity_date
FROM user_streaks s JOIN users u ON u.id = s.user_id;

-- notification_settings
SELECT u.name, ns.reminder_enabled, ns.reminder_time, ns.frequency, ns.allow_promo, ns.allow_challenge
FROM notification_settings ns JOIN users u ON u.id = ns.user_id;

-- notification_broadcasts (riwayat kiriman admin)
SELECT id, title, audience, sent_at FROM notification_broadcasts ORDER BY sent_at DESC;

-- notifications (notifikasi belum dibaca per pelajar)
SELECT u.name, n.type, n.title, n.created_at
FROM notifications n JOIN users u ON u.id = n.user_id
WHERE NOT n.is_read ORDER BY n.created_at DESC;

-- chat_messages (riwayat percakapan dengan Sinau Bot)
SELECT u.name, m.lesson_id, m.sender, m.content, m.created_at
FROM chat_messages m JOIN users u ON u.id = m.user_id
ORDER BY m.created_at;

-- password_resets (permintaan reset yang masih berlaku)
SELECT u.email, pr.expires_at, pr.attempts
FROM password_resets pr JOIN users u ON u.id = pr.user_id
WHERE pr.used_at IS NULL AND pr.expires_at > NOW();
