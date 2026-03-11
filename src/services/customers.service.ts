import { db } from '../config/database.js';

export async function getAll(filters: { search?: string; page?: number; per_page?: number }) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.search) {
    conditions.push(`(c.company_name ILIKE $${paramIndex} OR c.contact_person ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const page = Math.max(1, filters.page || 1);
  const perPage = Math.min(100, Math.max(1, filters.per_page || 50));
  const offset = (page - 1) * perPage;

  const countResult = await db.query(`SELECT COUNT(*) FROM customers c ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await db.query(
    `SELECT c.*, u.name as assigned_to_name,
       COALESCE(SUM(cs.sold_price), 0) as total_revenue,
       COUNT(cs.id) as service_count
     FROM customers c
     LEFT JOIN users u ON c.assigned_to = u.id
     LEFT JOIN customer_services cs ON c.id = cs.customer_id
     ${where}
     GROUP BY c.id, u.name
     ORDER BY c.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, perPage, offset]
  );

  return { customers: result.rows, total, page, per_page: perPage };
}

export async function getById(id: string) {
  const result = await db.query(
    `SELECT c.*, u.name as assigned_to_name
     FROM customers c
     LEFT JOIN users u ON c.assigned_to = u.id
     WHERE c.id = $1`,
    [id]
  );

  if (!result.rows[0]) return null;

  const services = await db.query(
    `SELECT cs.*, s.name as service_name, s.type as service_type, s.commission_rate,
            ROUND(cs.sold_price * s.commission_rate / 100, 2) as commission_amount,
            u.name as sold_by_name
     FROM customer_services cs
     JOIN services s ON cs.service_id = s.id
     LEFT JOIN users u ON cs.sold_by = u.id
     WHERE cs.customer_id = $1
     ORDER BY cs.sold_date DESC`,
    [id]
  );

  return { ...result.rows[0], services: services.rows };
}

export async function update(id: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex}`);
      params.push(value === '' ? null : value);
      paramIndex++;
    }
  }

  if (fields.length === 0) return getById(id);

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await db.query(
    `UPDATE customers SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

export async function assignService(customerId: string, data: {
  service_id: string;
  sold_price: number;
  price_model: string;
  sold_date?: string;
  notes?: string;
}, userId: string) {
  const result = await db.query(
    `INSERT INTO customer_services (customer_id, service_id, sold_price, price_model, sold_date, sold_by, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [customerId, data.service_id, data.sold_price, data.price_model,
     data.sold_date || new Date().toISOString().split('T')[0], userId, data.notes || null]
  );
  return result.rows[0];
}

export async function removeService(customerId: string, csId: string) {
  const result = await db.query(
    'DELETE FROM customer_services WHERE id = $1 AND customer_id = $2 RETURNING *',
    [csId, customerId]
  );
  return result.rows[0] || null;
}
