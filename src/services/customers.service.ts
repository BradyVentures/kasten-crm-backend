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

export async function create(data: {
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
  assigned_to?: string;
}, userId: string) {
  const result = await db.query(
    `INSERT INTO customers (company_name, contact_person, email, phone, website, address, city, postal_code, notes, assigned_to, converted_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      data.company_name,
      data.contact_person || null,
      data.email || null,
      data.phone || null,
      data.website || null,
      data.address || null,
      data.city || null,
      data.postal_code || null,
      data.notes || null,
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

  const services = await db.query(
    `SELECT cs.*, s.name as service_name, s.type as service_type, s.commission_rate,
            CASE
              WHEN cs.price_model = 'monatlich' AND cs.contract_months IS NOT NULL
              THEN ROUND(cs.sold_price * cs.contract_months * s.commission_rate / 100, 2)
              ELSE ROUND(cs.sold_price * s.commission_rate / 100, 2)
            END as commission_amount,
            u.name as sold_by_name,
            p.name as promotion_name
     FROM customer_services cs
     JOIN services s ON cs.service_id = s.id
     LEFT JOIN users u ON cs.sold_by = u.id
     LEFT JOIN promotions p ON cs.promotion_id = p.id
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
  contract_months?: number;
  sold_date?: string;
  notes?: string;
  promotion_id?: string;
}, userId: string) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    let finalPrice = data.sold_price;
    let originalPrice: number | null = null;
    let discountAmount: number | null = null;
    let promotionId: string | null = data.promotion_id || null;

    if (promotionId) {
      // Atomically validate + increment redemption counter
      const promoResult = await client.query(
        `UPDATE promotions
         SET current_redemptions = current_redemptions + 1,
             updated_at = NOW()
         WHERE id = $1
           AND is_active = true
           AND (valid_from IS NULL OR valid_from <= NOW())
           AND (valid_until IS NULL OR valid_until >= NOW())
           AND (max_redemptions IS NULL OR current_redemptions < max_redemptions)
         RETURNING *`,
        [promotionId]
      );

      if (promoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new Error('Aktion ist nicht mehr gültig oder bereits ausgeschöpft');
      }

      const promo = promoResult.rows[0];
      originalPrice = data.sold_price;

      if (promo.discount_type === 'fixed') {
        discountAmount = Math.min(promo.discount_value, data.sold_price);
      } else {
        discountAmount = Math.round(data.sold_price * promo.discount_value) / 100;
      }

      finalPrice = Math.max(0, Math.round((data.sold_price - discountAmount) * 100) / 100);
    }

    const result = await client.query(
      `INSERT INTO customer_services (customer_id, service_id, sold_price, price_model, contract_months, sold_date, sold_by, notes, promotion_id, original_price, discount_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [customerId, data.service_id, finalPrice, data.price_model,
       data.contract_months || null,
       data.sold_date || new Date().toISOString().split('T')[0], userId, data.notes || null,
       promotionId, originalPrice, discountAmount]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function removeService(customerId: string, csId: string) {
  const result = await db.query(
    'DELETE FROM customer_services WHERE id = $1 AND customer_id = $2 RETURNING *',
    [csId, customerId]
  );
  return result.rows[0] || null;
}
