import { db } from '../config/database.js';

const VALID_TRANSITIONS: Record<string, string[]> = {
  messung: ['angebot_erstellt', 'storniert'],
  angebot_erstellt: ['angebot_gesendet', 'storniert'],
  angebot_gesendet: ['angebot_angenommen', 'angebot_abgelehnt', 'storniert'],
  angebot_abgelehnt: ['messung', 'storniert'],
  angebot_angenommen: ['in_bearbeitung', 'storniert'],
  in_bearbeitung: ['abgeschlossen', 'storniert'],
};

export async function getAll(filters: { search?: string; status?: string; category?: string; customer_id?: string; page?: number; per_page?: number }) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.search) {
    conditions.push(`(p.project_number ILIKE $${idx} OR p.title ILIKE $${idx} OR c.company_name ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx++;
  }
  if (filters.status) { conditions.push(`p.status = $${idx}`); params.push(filters.status); idx++; }
  if (filters.category) { conditions.push(`p.category = $${idx}`); params.push(filters.category); idx++; }
  if (filters.customer_id) { conditions.push(`p.customer_id = $${idx}`); params.push(filters.customer_id); idx++; }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const page = Math.max(1, filters.page || 1);
  const perPage = Math.min(100, Math.max(1, filters.per_page || 50));
  const offset = (page - 1) * perPage;

  const countResult = await db.query(`SELECT COUNT(*) FROM projects p LEFT JOIN customers c ON p.customer_id = c.id ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await db.query(
    `SELECT p.*, c.company_name as customer_name, c.contact_person as customer_contact,
            u.name as assigned_to_name,
            (SELECT COUNT(*) FROM project_measurements pm WHERE pm.project_id = p.id) as measurement_count,
            (SELECT COALESCE(SUM(oi.total_price), 0) FROM offers o JOIN offer_items oi ON o.id = oi.offer_id WHERE o.project_id = p.id) as offer_total
     FROM projects p
     LEFT JOIN customers c ON p.customer_id = c.id
     LEFT JOIN users u ON p.assigned_to = u.id
     ${where}
     ORDER BY p.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, perPage, offset]
  );

  return { projects: result.rows, total, page, per_page: perPage };
}

export async function create(data: {
  customer_id: string;
  category: string;
  title: string;
  notes?: string;
  measurement_date?: string;
  assigned_to?: string;
  manufacturer_margin_percent?: number;
  installation_cost?: number;
}, userId: string) {
  const numResult = await db.query('SELECT next_project_number() as num');
  const projectNumber = numResult.rows[0].num;

  const result = await db.query(
    `INSERT INTO projects (project_number, customer_id, category, title, notes, measurement_date, assigned_to, created_by, manufacturer_margin_percent, installation_cost)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [projectNumber, data.customer_id, data.category, data.title, data.notes || null,
     data.measurement_date || null, data.assigned_to || null, userId,
     data.manufacturer_margin_percent || 0, data.installation_cost || 0]
  );
  return result.rows[0];
}

export async function getById(id: string) {
  const result = await db.query(
    `SELECT p.*, c.company_name as customer_name, c.contact_person as customer_contact,
            c.email as customer_email, c.phone as customer_phone, c.address as customer_address,
            c.city as customer_city, c.postal_code as customer_postal_code,
            u.name as assigned_to_name, uc.name as created_by_name
     FROM projects p
     LEFT JOIN customers c ON p.customer_id = c.id
     LEFT JOIN users u ON p.assigned_to = u.id
     LEFT JOIN users uc ON p.created_by = uc.id
     WHERE p.id = $1`,
    [id]
  );
  if (!result.rows[0]) return null;

  const measurements = await db.query(
    'SELECT * FROM project_measurements WHERE project_id = $1 ORDER BY sort_order, created_at',
    [id]
  );

  const documents = await db.query(
    `SELECT pd.*, u.name as uploaded_by_name
     FROM project_documents pd
     LEFT JOIN users u ON pd.uploaded_by = u.id
     WHERE pd.project_id = $1
     ORDER BY pd.created_at DESC`,
    [id]
  );

  const offers = await db.query(
    'SELECT id, offer_number, status, gross_total, created_at FROM offers WHERE project_id = $1 ORDER BY created_at DESC',
    [id]
  );

  const invoices = await db.query(
    'SELECT id, invoice_number, status, gross_total, created_at FROM invoices WHERE project_id = $1 ORDER BY created_at DESC',
    [id]
  );

  return {
    ...result.rows[0],
    measurements: measurements.rows,
    documents: documents.rows,
    offers: offers.rows,
    invoices: invoices.rows,
  };
}

export async function update(id: string, data: Record<string, unknown>) {
  const allowedFields = ['title', 'notes', 'measurement_date', 'assigned_to', 'manufacturer_margin_percent', 'installation_cost'];
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

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

  await db.query(`UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx}`, params);
  return getById(id);
}

export async function updateStatus(id: string, newStatus: string) {
  const current = await db.query('SELECT status FROM projects WHERE id = $1', [id]);
  if (!current.rows[0]) return null;

  const currentStatus = current.rows[0].status;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Ungueltige Statusaenderung: ${currentStatus} → ${newStatus}`);
  }

  const timestampFields: Record<string, string> = {
    angebot_erstellt: 'offer_created_at',
    angebot_gesendet: 'offer_sent_at',
    angebot_angenommen: 'offer_accepted_at',
    angebot_abgelehnt: 'offer_declined_at',
    abgeschlossen: 'completed_at',
    storniert: 'cancelled_at',
  };

  let extra = '';
  if (timestampFields[newStatus]) {
    extra = `, ${timestampFields[newStatus]} = NOW()`;
  }

  await db.query(
    `UPDATE projects SET status = $1, updated_at = NOW()${extra} WHERE id = $2`,
    [newStatus, id]
  );
  return getById(id);
}

// Measurements
export async function addMeasurement(projectId: string, data: {
  label?: string; width_mm: number; height_mm: number; depth_mm?: number;
  configuration?: Record<string, unknown>; photo_path?: string; notes?: string;
}) {
  const maxOrder = await db.query('SELECT COALESCE(MAX(sort_order), 0) + 1 as next FROM project_measurements WHERE project_id = $1', [projectId]);
  const result = await db.query(
    `INSERT INTO project_measurements (project_id, label, width_mm, height_mm, depth_mm, configuration, photo_path, notes, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [projectId, data.label || null, data.width_mm, data.height_mm, data.depth_mm || null,
     JSON.stringify(data.configuration || {}), data.photo_path || null, data.notes || null,
     maxOrder.rows[0].next]
  );
  return result.rows[0];
}

export async function updateMeasurement(projectId: string, measurementId: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (key === 'configuration') { fields.push(`${key} = $${idx}`); params.push(JSON.stringify(value)); }
      else { fields.push(`${key} = $${idx}`); params.push(value === '' ? null : value); }
      idx++;
    }
  }
  if (fields.length === 0) return null;
  params.push(measurementId, projectId);
  const result = await db.query(`UPDATE project_measurements SET ${fields.join(', ')} WHERE id = $${idx} AND project_id = $${idx + 1} RETURNING *`, params);
  return result.rows[0] || null;
}

export async function removeMeasurement(projectId: string, measurementId: string) {
  const result = await db.query('DELETE FROM project_measurements WHERE id = $1 AND project_id = $2', [measurementId, projectId]);
  return (result.rowCount || 0) > 0;
}
