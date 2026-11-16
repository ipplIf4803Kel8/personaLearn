// Menjalankan semua seed di folder ini berurutan (001_*.js, 002_*.js, ...). Aman dijalankan berulang.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import 'dotenv/config'
import pool from '../../src/config/db.js'

const dir = path.dirname(fileURLToPath(import.meta.url))
const files = fs.readdirSync(dir).filter((f) => /^\d+_.*\.js$/.test(f)).sort()

try {
  for (const file of files) {
    const { default: run } = await import(pathToFileURL(path.join(dir, file)))
    await run(pool)
    console.log(`Seed ${file} selesai`)
  }
} catch (err) {
  console.error('Seed gagal:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
