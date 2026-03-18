import { db } from '../config/database.js';

export async function getAll(filters: { status?: string; assigned_to?: string; customer_id?: string }) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.status && ['offen', 'erledigt'].includes(filters.status)) {
    conditions.push(`t.status = $${idx}`);
    params.push(filters.status);
    idx++;
  }

  if (filters.assigned_to) {
    conditions.push(`t.assigned_to = $${idx}`);
    params.push(filters.assigned_to);
    idx++;
  }

  if (filters.customer_id) {
    conditions.push(`t.customer_id = $${idx}`);
    params.push(filters.customer_id);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT t.*,
            c.company_name as customer_name,
            s.name as service_name,
            ua.name as assigned_to_name,
            uc.name as created_by_name
     FROM todos t
     LEFT JOIN customers c ON t.customer_id = c.id
     LEFT JOIN customer_services cs ON t.customer_service_id = cs.id
     LEFT JOIN services s ON cs.service_id = s.id
     LEFT JOIN users ua ON t.assigned_to = ua.id
     LEFT JOIN users uc ON t.created_by = uc.id
     ${where}
     ORDER BY
       CASE t.status WHEN 'offen' THEN 0 ELSE 1 END,
       t.due_date ASC NULLS LAST,
       t.created_at DESC`,
    params
  );

  return result.rows;
}

export async function create(data: {
  title: string;
  description?: string;
  due_date?: string;
  customer_id?: string;
  customer_service_id?: string;
  assigned_to?: string;
}, userId: string) {
  const result = await db.query(
    `INSERT INTO todos (title, description, due_date, customer_id, customer_service_id, assigned_to, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.title,
      data.description || null,
      data.due_date || null,
      data.customer_id || null,
      data.customer_service_id || null,
      data.assigned_to || null,
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
      fields.push(`${key} = $${idx}`);
      params.push(value === '' ? null : value);
      idx++;
    }
  }

  if (fields.length === 0) return null;

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await db.query(
    `UPDATE todos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

export async function remove(id: string) {
  const result = await db.query('DELETE FROM todos WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}
