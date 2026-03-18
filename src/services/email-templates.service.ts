import { db } from '../config/database.js';

export async function getAll() {
  const result = await db.query(`
    SELECT
      et.*,
      u1.name AS created_by_name,
      u2.name AS updated_by_name
    FROM email_templates et
    LEFT JOIN users u1 ON et.created_by = u1.id
    LEFT JOIN users u2 ON et.updated_by = u2.id
    ORDER BY et.category, et.sort_order, et.title
  `);
  return result.rows;
}

export async function getCategories() {
  const result = await db.query(`
    SELECT DISTINCT category FROM email_templates ORDER BY category
  `);
  return result.rows.map((r: { category: string }) => r.category);
}

export async function create(data: {
  title: string;
  subject?: string;
  body?: string;
  category?: string;
  sort_order?: number;
}, userId: string) {
  const result = await db.query(`
    INSERT INTO email_templates (title, subject, body, category, sort_order, created_by, updated_by)
    VALUES ($1, $2, $3, $4, $5, $6, $6)
    RETURNING *
  `, [
    data.title,
    data.subject || '',
    data.body || '',
    data.category || 'Allgemein',
    data.sort_order || 0,
    userId,
  ]);
  return result.rows[0];
}

export async function update(id: string, data: Record<string, unknown>, userId: string) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_by = $${idx}`);
  values.push(userId);
  idx++;

  fields.push(`updated_at = NOW()`);

  values.push(id);

  const result = await db.query(`
    UPDATE email_templates SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *
  `, values);

  return result.rows[0];
}

export async function remove(id: string) {
  await db.query('DELETE FROM email_templates WHERE id = $1', [id]);
}
