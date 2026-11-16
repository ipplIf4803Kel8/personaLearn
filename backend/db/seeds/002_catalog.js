// Kategori, kelas terbit beserta pelajaran dan tag, dan tantangan aktif.
// Video adalah tautan YouTube embed contoh; satu video dipakai bersama oleh pelajaran dalam satu kelas.

const categories = [
  ['Pemrograman', 'pemrograman'],
  ['Desain', 'desain'],
  ['Bahasa', 'bahasa'],
  ['Bisnis', 'bisnis'],
]

const embed = (id) => `https://www.youtube.com/embed/${id}`

const courses = [
  {
    category: 'pemrograman',
    title: 'Dasar Pemrograman JavaScript',
    description: 'Belajar fondasi JavaScript dari nol: variabel, fungsi, dan logika dasar untuk pemula.',
    level: 'Beginner',
    video: embed('PkZNo7MFNFg'),
    vark: ['visual', 'reading'],
    personality: ['structured', 'INTJ', 'ISTJ'],
    lessons: ['Pengenalan JavaScript', 'Variabel dan Tipe Data', 'Percabangan dan Perulangan', 'Fungsi dan Scope', 'Array dan Objek'],
  },
  {
    category: 'pemrograman',
    title: 'Python untuk Pemula',
    description: 'Mulai pemrograman dengan Python lewat latihan langsung yang mudah diikuti.',
    level: 'Beginner',
    video: embed('rfscVS0vtbw'),
    vark: ['kinesthetic', 'visual'],
    personality: ['exploratory', 'self-paced', 'INTP'],
    lessons: ['Instalasi dan Hello World', 'Tipe Data dan Operator', 'Kondisi dan Perulangan', 'Fungsi', 'Mengelola File'],
  },
  {
    category: 'pemrograman',
    title: 'HTML dan CSS untuk Pemula',
    description: 'Bangun halaman web pertamamu dengan HTML dan CSS.',
    level: 'Beginner',
    video: embed('UB1O30fR-EE'),
    vark: ['visual', 'kinesthetic'],
    personality: ['exploratory', 'ENFP', 'ISFP'],
    lessons: ['Struktur Dokumen HTML', 'Teks, Tautan, dan Gambar', 'Dasar CSS', 'Layout dengan Flexbox', 'Halaman Responsif'],
  },
  {
    category: 'desain',
    title: 'Prinsip Desain UI Modern',
    description: 'Memahami tipografi, warna, dan tata letak untuk antarmuka digital.',
    level: 'Intermediate',
    video: embed('c9Wg6Cb_YlU'),
    vark: ['visual'],
    personality: ['exploratory', 'INFP', 'ENFP'],
    lessons: ['Dasar Tipografi', 'Teori Warna', 'Grid dan Tata Letak', 'Komponen dan Konsistensi', 'Menguji Desain dengan Pengguna'],
  },
  {
    category: 'bahasa',
    title: 'Bahasa Inggris Percakapan',
    description: 'Latihan percakapan bahasa Inggris untuk kebutuhan sehari-hari.',
    level: 'Beginner',
    video: embed('juKd26qkNAw'),
    vark: ['auditory'],
    personality: ['collaborative', 'ESFJ', 'ENFJ'],
    lessons: ['Greeting dan Perkenalan', 'Percakapan Sehari-hari', 'Berbelanja dan Memesan Makanan', 'Bertanya Arah', 'Bercerita tentang Diri Sendiri'],
  },
  {
    category: 'bisnis',
    title: 'Dasar Kewirausahaan',
    description: 'Dari menemukan ide sampai menyusun rencana bisnis sederhana.',
    level: 'Intermediate',
    video: embed('Hn6ZCfL0Jqg'),
    vark: ['reading', 'auditory'],
    personality: ['structured', 'collaborative', 'ENTJ', 'ESTJ'],
    lessons: ['Mencari Ide Bisnis', 'Mengenal Pelanggan', 'Model Bisnis Sederhana', 'Menghitung Modal dan Harga', 'Menyusun Rencana Bisnis'],
  },
]

const challenges = [
  ['Selesaikan 3 Pelajaran Minggu Ini', 'Tuntaskan 3 pelajaran dari kelas mana pun sebelum akhir minggu.', 50, 6, null],
  ['Tuntaskan Dasar Pemrograman JavaScript', 'Selesaikan seluruh pelajaran di kelas Dasar Pemrograman JavaScript.', 100, 13, 'Dasar Pemrograman JavaScript'],
  ['Belajar Tiga Hari Berturut-turut', 'Buka dan selesaikan satu pelajaran selama tiga hari beruntun.', 30, 6, null],
]

async function seedCourse(pool, c) {
  // Kelas dikenali dari judul; jika sudah ada, baris dan pelajarannya dibiarkan apa adanya.
  const { rows } = await pool.query(
    `INSERT INTO courses (category_id, title, description, level, is_published)
     SELECT id, $2::text, $3, $4, TRUE FROM categories WHERE slug = $1
       AND NOT EXISTS (SELECT 1 FROM courses WHERE title = $2)
     RETURNING id`,
    [c.category, c.title, c.description, c.level]
  )
  const { rows: found } = rows.length ? { rows } : await pool.query('SELECT id FROM courses WHERE title = $1', [c.title])
  const courseId = found[0].id

  for (const [type, values] of [['vark', c.vark], ['personality', c.personality]]) {
    for (const value of values) {
      await pool.query(
        'INSERT INTO course_tags (course_id, tag_type, tag_value) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [courseId, type, value]
      )
    }
  }

  for (const [i, title] of c.lessons.entries()) {
    await pool.query(
      `INSERT INTO lessons (course_id, title, description, video_url, duration_seconds, position)
       SELECT $1::int, $2::text, $3, $4, $5, COALESCE((SELECT MAX(position) FROM lessons WHERE course_id = $1), 0) + 1
       WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = $1 AND title = $2)`,
      [courseId, title, `Materi ${title.toLowerCase()} pada kelas ${c.title}.`, c.video, 420 + i * 90]
    )
  }
}

async function seedChallenge(pool, [title, description, points, days, courseTitle]) {
  await pool.query(
    `INSERT INTO challenges (title, description, reward_points, starts_at, ends_at, course_id)
     SELECT $1::text, $2, $3, CURRENT_DATE, CURRENT_DATE + $4::int, (SELECT id FROM courses WHERE title = $5)
     WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE title = $1)`,
    [title, description, points, days, courseTitle]
  )
}

export default async function seedCatalog(pool) {
  for (const [name, slug] of categories) {
    await pool.query('INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING', [name, slug])
  }
  for (const c of courses) await seedCourse(pool, c)
  for (const c of challenges) await seedChallenge(pool, c)
}
