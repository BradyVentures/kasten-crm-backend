import { db } from '../config/database.js';

export async function getAll(filters: { search?: string; status?: string; customer_id?: string; page?: number; per_page?: number }) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.search) {
    conditions.push(`(o.offer_number ILIKE $${idx} OR o.customer_name ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx++;
  }
  if (filters.status) {
    conditions.push(`o.status = $${idx}`);
    params.push(filters.status);
    idx++;
  }
  if (filters.customer_id) {
    conditions.push(`o.customer_id = $${idx}`);
    params.push(filters.customer_id);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const page = Math.max(1, filters.page || 1);
  const perPage = Math.min(100, Math.max(1, filters.per_page || 50));
  const offset = (page - 1) * perPage;

  const countResult = await db.query(`SELECT COUNT(*) FROM offers o ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await db.query(
    `SELECT o.*, u.name as created_by_name
     FROM offers o
     LEFT JOIN users u ON o.created_by = u.id
     ${where}
     ORDER BY o.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, perPage, offset]
  );

  return { offers: result.rows, total, page, per_page: perPage };
}

export async function create(data: {
  project_id?: string;
  customer_id?: string;
  customer_name: string;
  customer_address?: string;
  customer_email?: string;
  customer_phone?: string;
  notes?: string;
  valid_until?: string;
  discount_amount?: number;
  discount_note?: string;
  visualizer_image_url?: string;
}, userId: string) {
  const offerNumberResult = await db.query('SELECT next_offer_number() as num');
  const offerNumber = offerNumberResult.rows[0].num;

  const result = await db.query(
    `INSERT INTO offers (offer_number, project_id, customer_id, customer_name, customer_address, customer_email, customer_phone, notes, valid_until, discount_amount, discount_note, created_by, visualizer_image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      offerNumber,
      data.project_id || null,
      data.customer_id || null,
      data.customer_name,
      data.customer_address || null,
      data.customer_email || null,
      data.customer_phone || null,
      data.notes || null,
      data.valid_until || null,
      data.discount_amount || 0,
      data.discount_note || null,
      userId,
      data.visualizer_image_url || null,
    ]
  );
  return result.rows[0];
}

export async function getById(id: string) {
  const result = await db.query(
    `SELECT o.*, u.name as created_by_name
     FROM offers o
     LEFT JOIN users u ON o.created_by = u.id
     WHERE o.id = $1`,
    [id]
  );
  if (!result.rows[0]) return null;

  const items = await db.query(
    'SELECT * FROM offer_items WHERE offer_id = $1 ORDER BY sort_order',
    [id]
  );

  return { ...result.rows[0], items: items.rows };
}

export async function update(id: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  const allowedFields = ['customer_id', 'customer_name', 'customer_address', 'customer_email', 'customer_phone', 'notes', 'valid_until', 'discount_amount', 'discount_note', 'vat_rate', 'visualizer_image_url'];
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && allowedFields.includes(key)) {
      fields.push(`${key} = $${idx}`);
      params.push(value === '' ? null : value);
      idx++;
    }
  }

  if (fields.length === 0) return getById(id);

  fields.push('updated_at = NOW()');
  params.push(id);

  await db.query(`UPDATE offers SET ${fields.join(', ')} WHERE id = $${idx}`, params);
  await recalculateTotals(id);
  return getById(id);
}

export async function updateStatus(id: string, status: string) {
  const timestampField: Record<string, string> = {
    gesendet: 'sent_at',
    angenommen: 'accepted_at',
    abgelehnt: 'declined_at',
  };

  let extra = '';
  if (timestampField[status]) {
    extra = `, ${timestampField[status]} = NOW()`;
  }
  if (status === 'entwurf') {
    extra = ', sent_at = NULL, accepted_at = NULL, declined_at = NULL';
  }

  const result = await db.query(
    `UPDATE offers SET status = $1, updated_at = NOW()${extra} WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0] || null;
}

export async function addItem(offerId: string, data: {
  category_slug: string;
  product_name: string;
  description?: string;
  configuration: Record<string, unknown>;
  quantity: number;
  unit_price: number;
}) {
  const totalPrice = Math.round(data.quantity * data.unit_price * 100) / 100;

  const maxOrder = await db.query(
    'SELECT COALESCE(MAX(sort_order), 0) + 1 as next FROM offer_items WHERE offer_id = $1',
    [offerId]
  );

  const result = await db.query(
    `INSERT INTO offer_items (offer_id, category_slug, product_name, description, configuration, quantity, unit_price, total_price, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [offerId, data.category_slug, data.product_name, data.description || null,
     JSON.stringify(data.configuration), data.quantity, data.unit_price, totalPrice,
     maxOrder.rows[0].next]
  );

  await recalculateTotals(offerId);
  return result.rows[0];
}

export async function updateItem(offerId: string, itemId: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (key === 'configuration') {
        fields.push(`${key} = $${idx}`);
        params.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = $${idx}`);
        params.push(value);
      }
      idx++;
    }
  }

  if (fields.length === 0) return null;

  params.push(itemId, offerId);
  const result = await db.query(
    `UPDATE offer_items SET ${fields.join(', ')} WHERE id = $${idx} AND offer_id = $${idx + 1} RETURNING *`,
    params
  );

  if (result.rows[0]) {
    // Recalculate item total
    const item = result.rows[0];
    const total = Math.round(item.quantity * item.unit_price * 100) / 100;
    await db.query('UPDATE offer_items SET total_price = $1 WHERE id = $2', [total, itemId]);
    await recalculateTotals(offerId);
  }

  return result.rows[0] || null;
}

export async function removeItem(offerId: string, itemId: string) {
  const result = await db.query(
    'DELETE FROM offer_items WHERE id = $1 AND offer_id = $2 RETURNING *',
    [itemId, offerId]
  );
  if (result.rows[0]) {
    await recalculateTotals(offerId);
  }
  return result.rows[0] || null;
}

export async function duplicate(id: string, userId: string) {
  const original = await getById(id);
  if (!original) return null;

  const newOffer = await create({
    customer_id: original.customer_id,
    customer_name: original.customer_name,
    customer_address: original.customer_address,
    customer_email: original.customer_email,
    customer_phone: original.customer_phone,
    notes: original.notes,
    discount_amount: parseFloat(original.discount_amount),
    discount_note: original.discount_note,
  }, userId);

  for (const item of original.items) {
    await addItem(newOffer.id, {
      category_slug: item.category_slug,
      product_name: item.product_name,
      description: item.description,
      configuration: item.configuration,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price),
    });
  }

  return getById(newOffer.id);
}

export async function deleteOffer(id: string) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM offer_items WHERE offer_id = $1', [id]);
    const result = await client.query('DELETE FROM offers WHERE id = $1', [id]);
    await client.query('COMMIT');
    return (result.rowCount || 0) > 0;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Erstellt ein Angebot aus einer Visualizer-Anfrage (Website, kein Auth)
export async function createFromVisualizer(data: {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  category_slug: string;
  product_name: string;
  configuration: Record<string, unknown>;
  unit_price?: number;
  visualizer_image_url?: string;
  visualizer_request_id?: string;
  notes?: string;
}) {
  // Admin-User als created_by verwenden (erster Admin)
  const adminResult = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  const adminId = adminResult.rows[0]?.id || null;

  const offerNumberResult = await db.query('SELECT next_offer_number() as num');
  const offerNumber = offerNumberResult.rows[0].num;

  const offerResult = await db.query(
    `INSERT INTO offers (offer_number, customer_name, customer_email, customer_phone, notes, visualizer_image_url, visualizer_request_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      offerNumber,
      data.customer_name,
      data.customer_email,
      data.customer_phone || null,
      data.notes || null,
      data.visualizer_image_url || null,
      data.visualizer_request_id || null,
      adminId,
    ]
  );

  const offer = offerResult.rows[0];

  // Position hinzufügen
  if (data.category_slug && data.product_name) {
    await addItem(offer.id, {
      category_slug: data.category_slug,
      product_name: data.product_name,
      configuration: data.configuration || {},
      quantity: 1,
      unit_price: data.unit_price || 0,
    });
  }

  return getById(offer.id);
}

async function recalculateTotals(offerId: string) {
  const offer = await db.query('SELECT discount_amount, vat_rate FROM offers WHERE id = $1', [offerId]);
  if (!offer.rows[0]) return;

  const itemsSum = await db.query(
    'SELECT COALESCE(SUM(total_price), 0) as sum FROM offer_items WHERE offer_id = $1',
    [offerId]
  );

  const itemTotal = parseFloat(itemsSum.rows[0].sum);
  const discount = parseFloat(offer.rows[0].discount_amount) || 0;
  const netTotal = Math.round((itemTotal - discount) * 100) / 100;
  const vatRate = parseFloat(offer.rows[0].vat_rate);
  const vatAmount = Math.round(netTotal * vatRate) / 100;
  const grossTotal = Math.round((netTotal + vatAmount) * 100) / 100;

  await db.query(
    'UPDATE offers SET net_total = $1, vat_amount = $2, gross_total = $3, updated_at = NOW() WHERE id = $4',
    [netTotal, vatAmount, grossTotal, offerId]
  );
}
