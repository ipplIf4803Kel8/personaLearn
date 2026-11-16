import pool from '../config/db.js'
import { toCamel } from '../utils/camelCase.js'
import { updateRow } from '../utils/sqlUpdate.js'

const COLUMNS = { name: 'name', slug: 'slug' }

export class Category {
  #id
  #name
  #slug

  constructor({ id, name, slug }) {
    this.#id = id
    this.#name = name
    this.#slug = slug
  }

  get id() {
    return this.#id
  }
  get name() {
    return this.#name
  }
  set name(value) {
    this.#name = value
  }
  get slug() {
    return this.#slug
  }
  set slug(value) {
    this.#slug = value
  }

  toJSON() {
    return { id: this.#id, name: this.#name, slug: this.#slug }
  }

  // Hanya kategori yang punya kelas terbit dengan minimal satu pelajaran (untuk pelajar)
  static async findAll() {
    const { rows } = await pool.query(
      `SELECT id, name, slug FROM categories c
       WHERE EXISTS (SELECT 1 FROM courses co WHERE co.category_id = c.id AND co.is_published
                     AND EXISTS (SELECT 1 FROM lessons l WHERE l.course_id = co.id))
       ORDER BY name, id`,
    )
    return rows.map((row) => new Category(row))
  }

  // Bagian admin: bentuk baris apa adanya (camelCase)
  static async listAdmin() {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY id')
    return rows.map(toCamel)
  }

  static async insert({ name, slug }) {
    const { rows } = await pool.query('INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *', [name, slug])
    return toCamel(rows[0])
  }

  static update(id, data) {
    return updateRow('categories', COLUMNS, id, data)
  }

  static async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id])
    return rowCount > 0
  }
}
