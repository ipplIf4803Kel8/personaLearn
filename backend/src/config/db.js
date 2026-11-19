import pg from 'pg'
import 'dotenv/config'

// DATE dikembalikan sebagai string 'YYYY-MM-DD' agar tidak bergeser oleh zona waktu
pg.types.setTypeParser(1082, (v) => v)

const url = process.env.POSTGRES_URL
const noSslMode = (u) => { const x = new URL(u); x.searchParams.delete('sslmode'); return x.toString() }
const pool = new pg.Pool(
  url
    ? { connectionString: noSslMode(url), ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }
)

export default pool
