import { db } from '../config/database.js';

export async function getAll(category?: string) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (category) {
    conditions.push('(category = $1 OR category = \'allgemein\')');
    params.push(category);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await db.query(`SELECT * FROM saved_line_items ${where} ORDER BY sort_order, name`, params);
  return result.rows;
}

export async function create(data: { name: string; description?: string; default_price: number; category?: string }, userId: string) {
  const result = await db.query(
    'INSERT INTO saved_line_items (name, description, default_price, category, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [data.name, data.description || null, data.default_price, data.category || 'allgemein', userId]
  );
  return result.rows[0];
}

export async function update(id: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) { fields.push(`${key} = $${idx}`); params.push(value); idx++; }
  }
  if (fields.length === 0) return null;
  fields.push('updated_at = NOW()');
  params.push(id);
  const result = await db.query(`UPDATE saved_line_items SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
  return result.rows[0] || null;
}

export async function remove(id: string) {
  const result = await db.query('DELETE FROM saved_line_items WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}
