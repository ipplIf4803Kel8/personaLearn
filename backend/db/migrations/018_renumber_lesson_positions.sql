-- Nomori ulang posisi pelajaran 1..n per kelas (data lama punya posisi ganda), lalu cegah duplikat.
UPDATE lessons l SET position = r.rn
FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY position, id) AS rn FROM lessons) r
WHERE l.id = r.id AND l.position <> r.rn;

-- DEFERRABLE agar pertukaran posisi dalam satu transaksi tidak gagal di tengah jalan
ALTER TABLE lessons ADD CONSTRAINT lessons_course_position_key UNIQUE (course_id, position) DEFERRABLE INITIALLY DEFERRED;
