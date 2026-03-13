import { db } from '../config/database.js';

export async function getAll(includeInactive = false) {
  const where = includeInactive ? '' : 'WHERE p.is_active = true';
  const result = await db.query(
    `SELECT p.*, u.name as created_by_name
     FROM promotions p
     LEFT JOIN users u ON p.created_by = u.id
     ${where}
     ORDER BY p.created_at DESC`
  );
  return result.rows;
}

export async function getById(id: string) {
  const result = await db.query(
    `SELECT p.*, u.name as created_by_name
     FROM promotions p
     LEFT JOIN users u ON p.created_by = u.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function getActiveForService(serviceId: string) {
  const result = await db.query(
    `SELECT * FROM promotions
     WHERE is_active = true
       AND (valid_from IS NULL OR valid_from <= NOW())
       AND (valid_until IS NULL OR valid_until >= NOW())
       AND (max_redemptions IS NULL OR current_redemptions < max_redemptions)
       AND (applicable_service_ids IS NULL OR $1 = ANY(applicable_service_ids))
     ORDER BY discount_value DESC`,
    [serviceId]
  );
  return result.rows;
}

export async function create(data: {
  name: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  valid_from?: string | null;
  valid_until?: string | null;
  max_redemptions?: number | null;
  applicable_service_ids?: string[] | null;
}, userId: string) {
  const result = await db.query(
    `INSERT INTO promotions (name, description, discount_type, discount_value,
     valid_from, valid_until, max_redemptions, applicable_service_ids, created_by)
     VALUES ($1, $2, $3::discount_type, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.name,
      data.description || null,
      data.discount_type,
      data.discount_value,
      data.valid_from || null,
      data.valid_until || null,
      data.max_redemptions || null,
      data.applicable_service_ids || null,
      userId,
    ]
  );
  return result.rows[0];
}

export async function update(id: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (key === 'discount_type') {
        fields.push(`${key} = $${paramIndex}::discount_type`);
      } else {
        fields.push(`${key} = $${paramIndex}`);
      }
      params.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) return getById(id);

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await db.query(
    `UPDATE promotions SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

export async function softDelete(id: string) {
  const result = await db.query(
    'UPDATE promotions SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

export async function reactivate(id: string) {
  const result = await db.query(
    'UPDATE promotions SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}
