import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import 'dotenv/config'

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
}
const dbName = process.env.DB_NAME
const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
const noSslMode = (u) => { const x = new URL(u); x.searchParams.delete('sslmode'); return x.toString() }
const connect = () => new pg.Client(url ? { connectionString: noSslMode(url), ssl: { rejectUnauthorized: false } } : { ...config, database: dbName })

async function createDatabase() {
  const client = new pg.Client({ ...config, database: 'postgres' })
  await client.connect()
  const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
  if (result.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`)
    console.log(`Database ${dbName} dibuat`)
  }
  await client.end()
}

async function runMigrations() {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../db/migrations')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()
  const client = connect()
  await client.connect()
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT NOW())')
  const { rows } = await client.query('SELECT name FROM schema_migrations')
  const done = new Set(rows.map((r) => r.name))
  for (const file of files.filter((f) => !done.has(f))) {
    // satu transaksi per file, jadi migrasi yang gagal tidak meninggalkan skema setengah jadi
    await client.query('BEGIN')
    try {
      await client.query(fs.readFileSync(path.join(dir, file), 'utf8'))
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
    console.log(`Migrasi ${file} selesai`)
  }
  await client.end()
}

try {
  if (!url) await createDatabase()
  await runMigrations()
} catch (err) {
  console.error('Migrasi gagal:', err.message)
  process.exitCode = 1
}
