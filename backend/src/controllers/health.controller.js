import pool from '../config/db.js'

export async function getHealth(req, res) {
  let database = 'connected'
  try {
    await pool.query('SELECT 1')
  } catch {
    database = 'disconnected'
  }
  res.json({ status: 'ok', database })
}
