import pool from '../config/db.js'
import { toCamel } from './camelCase.js'

// UPDATE parsial. `table` dan `columns` ({ namaCamel: nama_kolom }) selalu konstanta dari kode,
// sedangkan nilai dari pengguna hanya masuk lewat parameter $n.
export async function updateRow(table, columns, id, data) {
  const keys = Object.keys(columns).filter((k) => data[k] !== undefined)
  if (!keys.length) {
    const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id])
    return rows[0] ? toCamel(rows[0]) : null
  }
  const sets = keys.map((k, i) => `${columns[k]} = $${i + 1}`).join(', ')
  const values = [...keys.map((k) => data[k]), id]
  const { rows } = await pool.query(`UPDATE ${table} SET ${sets} WHERE id = $${keys.length + 1} RETURNING *`, values)
  return rows[0] ? toCamel(rows[0]) : null
}
