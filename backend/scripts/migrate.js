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
  const client = new pg.Client({ ...config, database: dbName })
  await client.connect()
  for (const file of files) {
    await client.query(fs.readFileSync(path.join(dir, file), 'utf8'))
    console.log(`Migrasi ${file} selesai`)
  }
  await client.end()
}

try {
  await createDatabase()
  await runMigrations()
} catch (err) {
  console.error('Migrasi gagal:', err.message)
  process.exitCode = 1
}
