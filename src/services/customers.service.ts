import { db } from '../config/database.js';

export async function getAll(filters: { search?: string; page?: number; per_page?: number }) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.search) {
    conditions.push(`(c.company_name ILIKE $${paramIndex} OR c.contact_person ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.customer_number ILIKE $${paramIndex})`);
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
       (SELECT COUNT(*) FROM offers o WHERE o.customer_id = c.id) as offer_count
     FROM customers c
     LEFT JOIN users u ON c.assigned_to = u.id
     ${where}
     GROUP BY c.id, u.name
     ORDER BY c.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, perPage, offset]
  );

  return { customers: result.rows, total, page, per_page: perPage };
}

export async function create(data: {
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
  customer_number?: string;
  assigned_to?: string;
}, userId: string) {
  const result = await db.query(
    `INSERT INTO customers (company_name, contact_person, email, phone, mobile, address, city, postal_code, notes, customer_number, assigned_to, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      data.company_name,
      data.contact_person || null,
      data.email || null,
      data.phone || null,
      data.mobile || null,
      data.address || null,
      data.city || null,
      data.postal_code || null,
      data.notes || null,
      data.customer_number || null,
      data.assigned_to || null,
      userId,
    ]
  );
  return result.rows[0];
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

  const offers = await db.query(
    `SELECT o.id, o.offer_number, o.status, o.gross_total, o.created_at
     FROM offers o
     WHERE o.customer_id = $1
     ORDER BY o.created_at DESC`,
    [id]
  );

  return { ...result.rows[0], offers: offers.rows };
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

export async function deleteCustomer(id: string) {
  const result = await db.query('DELETE FROM customers WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}
