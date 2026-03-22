import { db } from '../config/database.js';

export async function getAll() {
  const result = await db.query(
    `SELECT pt.*, u.name as created_by_name
     FROM project_templates pt
     LEFT JOIN users u ON pt.created_by = u.id
     WHERE pt.is_active = true
     ORDER BY pt.name ASC`
  );
  return result.rows;
}

export async function getById(id: string) {
  const result = await db.query(
    'SELECT * FROM project_templates WHERE id = $1 AND is_active = true',
    [id]
  );
  return result.rows[0] || null;
}

export async function create(data: {
  name: string;
  description?: string;
  modules_json?: unknown;
}, userId: string) {
  const result = await db.query(
    `INSERT INTO project_templates (name, description, modules_json, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      data.name,
      data.description || null,
      JSON.stringify(data.modules_json || []),
      userId,
    ]
  );
  return result.rows[0];
}

export async function update(id: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (key === 'modules_json') {
        fields.push(`${key} = $${idx}`);
        params.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = $${idx}`);
        params.push(value === '' ? null : value);
      }
      idx++;
    }
  }

  if (fields.length === 0) return null;

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await db.query(
    `UPDATE project_templates SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

export async function remove(id: string) {
  const result = await db.query(
    'UPDATE project_templates SET is_active = false, updated_at = NOW() WHERE id = $1',
    [id]
  );
  return (result.rowCount || 0) > 0;
}
