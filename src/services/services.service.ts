import { db } from '../config/database.js';

export async function getAll(includeInactive = false) {
  const where = includeInactive ? '' : 'WHERE is_active = true';
  const result = await db.query(
    `SELECT * FROM services ${where} ORDER BY sort_order ASC, name ASC`
  );
  return result.rows;
}

export async function create(data: {
  name: string;
  description?: string;
  base_price: number;
  price_model: string;
  type: string;
  sort_order?: number;
  commission_rate?: number;
}) {
  const result = await db.query(
    `INSERT INTO services (name, description, base_price, price_model, type, sort_order, commission_rate)
     VALUES ($1, $2, $3, $4, $5::service_type, $6, $7)
     RETURNING *`,
    [data.name, data.description || null, data.base_price, data.price_model, data.type, data.sort_order || 0, data.commission_rate || 0]
  );
  return result.rows[0];
}

export async function update(id: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (key === 'type') {
        fields.push(`${key} = $${paramIndex}::service_type`);
      } else {
        fields.push(`${key} = $${paramIndex}`);
      }
      params.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) return null;

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await db.query(
    `UPDATE services SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

export async function softDelete(id: string) {
  const result = await db.query(
    'UPDATE services SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}
