import { hashPassword } from '../../src/utils/security.js'

// Akun yang sudah ada tidak ditimpa, jadi kata sandi yang diubah tidak kembali ke default.
export default async function seedUsers(pool) {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) throw new Error('ADMIN_EMAIL dan ADMIN_PASSWORD belum diisi di backend/.env')

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ('Admin personaLearn', $1, $2, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [adminEmail.toLowerCase(), hashPassword(adminPassword)]
  )

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, phone) VALUES ('Pelajar Contoh', 'student@personalearn.id', $1, '081234567890')
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id`,
    [hashPassword('student123')]
  )
  const userId = rows[0].id
  await pool.query(
    `INSERT INTO learning_preferences (user_id, mbti_type, vark_style) VALUES ($1, 'INTP', 'visual')
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  )
  await pool.query('INSERT INTO notification_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [userId])
  await pool.query('INSERT INTO user_streaks (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [userId])
}
