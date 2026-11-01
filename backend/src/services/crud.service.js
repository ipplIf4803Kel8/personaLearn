import pool from '../config/db.js'

const camel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
const snake = (s) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)

export const toCamel = (row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [camel(k), v]))

const fail = (status, message) => Object.assign(new Error(message), { status })

// Handler CRUD standar. `fields` (camelCase) adalah whitelist kolom yang boleh ditulis,
// jadi nama kolom yang disisipkan ke SQL selalu berasal dari kode, bukan dari request.
export function crud(table, fields, { required = [], listSql } = {}) {
  const pick = (body) => fields.filter((f) => body[f] !== undefined).map((f) => [snake(f), body[f]])

  return {
    async list(req, res) {
      const { rows } = await pool.query(listSql ?? `SELECT * FROM ${table} ORDER BY id`)
      res.json(rows.map(toCamel))
    },

    async create(req, res) {
      const missing = required.filter((f) => req.body[f] === undefined || req.body[f] === '')
      if (missing.length) throw fail(400, `Field wajib diisi: ${missing.join(', ')}`)
      const data = pick(req.body)
      const { rows } = await pool.query(
        `INSERT INTO ${table} (${data.map(([c]) => c)}) VALUES (${data.map((_, i) => `$${i + 1}`)}) RETURNING *`,
        data.map(([, v]) => v)
      )
      res.status(201).json(toCamel(rows[0]))
    },

    async update(req, res) {
      const data = pick(req.body)
      if (!data.length) throw fail(400, 'Tidak ada data untuk diubah')
      const { rows } = await pool.query(
        `UPDATE ${table} SET ${data.map(([c], i) => `${c} = $${i + 1}`)} WHERE id = $${data.length + 1} RETURNING *`,
        [...data.map(([, v]) => v), req.params.id]
      )
      if (!rows[0]) throw fail(404, 'Data tidak ditemukan')
      res.json(toCamel(rows[0]))
    },

    async remove(req, res) {
      const { rowCount } = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id])
      if (!rowCount) throw fail(404, 'Data tidak ditemukan')
      res.status(204).end()
    },
  }
}
