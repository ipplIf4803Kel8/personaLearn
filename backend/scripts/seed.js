import 'dotenv/config'
import pool from '../src/config/db.js'
import { hashPassword } from '../src/services/auth.service.js'

try {
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ('Admin personaLearn', $1, $2, 'admin') ON CONFLICT (email) DO NOTHING`,
    [process.env.ADMIN_EMAIL, hashPassword(process.env.ADMIN_PASSWORD)]
  )

  const { rowCount } = await pool.query('SELECT 1 FROM categories LIMIT 1')
  if (!rowCount) {
    await pool.query(`
      INSERT INTO categories (name, slug) VALUES
        ('Pemrograman', 'pemrograman'), ('Desain', 'desain'), ('Bahasa', 'bahasa'), ('Bisnis', 'bisnis');
      INSERT INTO courses (category_id, title, description, level, is_published, vark_tags, personality_tags) VALUES
        (1, 'Dasar Pemrograman JavaScript', 'Belajar fondasi JavaScript dari nol untuk pemula.', 'Beginner', TRUE, '{visual,reading}', '{structured}'),
        (2, 'Prinsip Desain UI Modern', 'Memahami tipografi, warna, dan tata letak untuk antarmuka digital.', 'Intermediate', TRUE, '{visual}', '{exploratory}'),
        (3, 'Bahasa Inggris Percakapan', 'Latihan percakapan bahasa Inggris untuk kebutuhan sehari-hari.', 'Beginner', FALSE, '{auditory}', '{collaborative}');
      INSERT INTO lessons (course_id, title, duration_seconds, position) VALUES
        (1, 'Pengenalan JavaScript', 540, 1), (1, 'Variabel dan Tipe Data', 620, 2), (1, 'Fungsi dan Scope', 700, 3),
        (2, 'Dasar Tipografi', 480, 1), (2, 'Teori Warna', 510, 2),
        (3, 'Greeting dan Perkenalan', 400, 1), (3, 'Percakapan Sehari-hari', 450, 2);
      INSERT INTO challenges (title, description, reward_points, starts_at, ends_at, course_id) VALUES
        ('Selesaikan 3 Pelajaran Minggu Ini', 'Tuntaskan 3 pelajaran dari kelas mana pun sebelum akhir minggu.', 50, CURRENT_DATE, CURRENT_DATE + 6, NULL),
        ('Tuntaskan Dasar Pemrograman JavaScript', 'Selesaikan seluruh pelajaran di kelas Dasar Pemrograman JavaScript.', 100, CURRENT_DATE, CURRENT_DATE + 13, 1);
      INSERT INTO notifications (title, body) VALUES
        ('Tantangan baru sudah tersedia', 'Cek tantangan mingguan terbaru di halaman Kelas Saya.');
    `)
    const pw = hashPassword('pelajar123')
    await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, is_active, mbti_type, vark_style, last_login_at) VALUES
        ('Samsul Arifin', 'samsul@example.com', $1, '081234567890', TRUE, 'INTP', 'visual', NOW()),
        ('Dewi Lestari', 'dewi@example.com', $1, '081298765432', TRUE, 'ENFJ', 'auditory', NOW()),
        ('Budi Santoso', 'budi@example.com', $1, '081355512345', FALSE, NULL, 'reading', NULL)`,
      [pw]
    )
    await pool.query(`
      INSERT INTO enrollments (user_id, course_id, progress_percent, rating)
        SELECT u.id, c.id, v.p, v.r FROM (VALUES
          ('samsul@example.com', 1, 67, 5), ('samsul@example.com', 2, 20, 4), ('dewi@example.com', 3, 100, 4)
        ) AS v(email, course, p, r) JOIN users u ON u.email = v.email JOIN courses c ON c.id = v.course;
      INSERT INTO lesson_progress (user_id, lesson_id)
        SELECT u.id, 1 FROM users u WHERE u.email = 'samsul@example.com';
      INSERT INTO chat_messages (user_id, message)
        SELECT id, 'Halo Sinau Bot' FROM users WHERE email = 'samsul@example.com';
    `)
  }
  console.log('Seed selesai')
} catch (err) {
  console.error('Seed gagal:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
