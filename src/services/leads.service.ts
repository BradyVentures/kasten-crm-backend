import { db } from '../config/database.js';
import { CreateLeadInput, UpdateLeadInput } from '../validators/leads.schema.js';
import { LeadStatus } from '../types/index.js';
import { REGIONS } from '../config/regions.js';

interface LeadFilters {
  status?: string;
  assigned_to?: string;
  search?: string;
  bundesland?: string;
  branche?: string;
  missing_field?: string;
  regions?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  per_page?: number;
}

function buildFilterConditions(filters: LeadFilters) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.status) {
    const statuses = filters.status.split(',');
    conditions.push(`l.status = ANY($${paramIndex}::lead_status[])`);
    params.push(statuses);
    paramIndex++;
  }

  if (filters.assigned_to) {
    conditions.push(`l.assigned_to = $${paramIndex}`);
    params.push(filters.assigned_to);
    paramIndex++;
  }

  if (filters.search) {
    conditions.push(`(l.company_name ILIKE $${paramIndex} OR l.contact_person ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.bundesland) {
    conditions.push(`l.bundesland = $${paramIndex}`);
    params.push(filters.bundesland);
    paramIndex++;
  }

  if (filters.branche) {
    conditions.push(`l.branche = $${paramIndex}`);
    params.push(filters.branche);
    paramIndex++;
  }

  // Filter for leads missing specific fields
  if (filters.missing_field) {
    const allowedFields = ['phone', 'email', 'website', 'contact_person', 'city', 'bundesland'];
    const fields = filters.missing_field.split(',');
    for (const f of fields) {
      if (allowedFields.includes(f)) {
        conditions.push(`(l.${f} IS NULL OR l.${f} = '' OR LOWER(TRIM(l.${f})) IN ('-', '–', '—', 'k.a.', 'n/a', 'keine', 'minimal', 'nur verzeichnis'))`);
      }
    }
  }

  // Region filter: comma-separated region IDs → OR of PLZ ranges
  if (filters.regions) {
    const regionIds = filters.regions.split(',');
    const regionConditions: string[] = [];
    for (const rid of regionIds) {
      const region = REGIONS.find(r => r.id === rid);
      if (region) {
        regionConditions.push(`(l.postal_code >= $${paramIndex} AND l.postal_code <= $${paramIndex + 1})`);
        params.push(region.plzFrom, region.plzTo);
        paramIndex += 2;
      }
    }
    if (regionConditions.length > 0) {
      conditions.push(`(${regionConditions.join(' OR ')})`);
    }
  }

  return { conditions, params, paramIndex };
}

export async function getAll(filters: LeadFilters) {
  const { conditions, params, paramIndex } = buildFilterConditions(filters);

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortBy = ['company_name', 'status', 'created_at', 'updated_at', 'bundesland', 'city', 'branche', 'website_status', 'contact_person', 'phone', 'postal_code'].includes(filters.sort_by || '')
    ? `l.${filters.sort_by}` : 'l.created_at';
  const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC';
  const page = Math.max(1, filters.page || 1);
  const perPage = Math.min(500, Math.max(1, filters.per_page || 50));
  const offset = (page - 1) * perPage;

  const countResult = await db.query(`SELECT COUNT(*) FROM leads l ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await db.query(
    `SELECT l.*, u.name as assigned_to_name
     FROM leads l
     LEFT JOIN users u ON l.assigned_to = u.id
     ${where}
     ORDER BY ${sortBy} ${sortOrder}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, perPage, offset]
  );

  return { leads: result.rows, total, page, per_page: perPage };
}

export async function getRegionCounts(filters: Omit<LeadFilters, 'regions' | 'page' | 'per_page' | 'sort_by' | 'sort_order'>) {
  const { conditions, params, paramIndex } = buildFilterConditions(filters);
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const counts: Record<string, number> = {};
  for (const region of REGIONS) {
    const result = await db.query(
      `SELECT COUNT(*) FROM leads l ${where} ${where ? 'AND' : 'WHERE'} l.postal_code >= $${paramIndex} AND l.postal_code <= $${paramIndex + 1}`,
      [...params, region.plzFrom, region.plzTo]
    );
    counts[region.id] = parseInt(result.rows[0].count, 10);
  }
  return counts;
}

export async function bulkDelete(ids: string[]) {
  if (ids.length === 0) return { deleted: 0 };

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM lead_locks WHERE lead_id = ANY($1)', [ids]);
    await client.query('DELETE FROM lead_activities WHERE lead_id = ANY($1)', [ids]);
    const result = await client.query('DELETE FROM leads WHERE id = ANY($1)', [ids]);
    await client.query('COMMIT');
    return { deleted: result.rowCount || 0 };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getDistinctValues() {
  const bundeslaender = await db.query(
    "SELECT DISTINCT bundesland FROM leads WHERE bundesland IS NOT NULL AND bundesland != '' ORDER BY bundesland"
  );
  const cities = await db.query(
    "SELECT DISTINCT city FROM leads WHERE city IS NOT NULL AND city != '' ORDER BY city"
  );
  const branchen = await db.query(
    "SELECT DISTINCT branche FROM leads WHERE branche IS NOT NULL AND branche != '' ORDER BY branche"
  );
  return {
    bundeslaender: bundeslaender.rows.map(r => r.bundesland),
    cities: cities.rows.map(r => r.city),
    branchen: branchen.rows.map(r => r.branche),
  };
}

export async function getById(id: string) {
  const result = await db.query(
    `SELECT l.*, u.name as assigned_to_name
     FROM leads l
     LEFT JOIN users u ON l.assigned_to = u.id
     WHERE l.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function create(data: CreateLeadInput, userId: string) {
  const result = await db.query(
    `INSERT INTO leads (company_name, contact_person, email, phone, website, address, city, postal_code, source, notes, assigned_to, created_by, branche, website_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [data.company_name, data.contact_person || null, data.email || null, data.phone || null,
     data.website || null, data.address || null, data.city || null, data.postal_code || null,
     data.source || null, data.notes || null, data.assigned_to || null, userId,
     data.branche || null, data.website_status || null]
  );

  await logActivity(result.rows[0].id, userId, 'erstellt', 'Lead erstellt');
  return result.rows[0];
}

export async function update(id: string, data: UpdateLeadInput) {
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

  fields.push(`updated_at = NOW()`);
  params.push(id);

  const result = await db.query(
    `UPDATE leads SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

export async function updateStatus(id: string, status: LeadStatus, userId: string) {
  const current = await getById(id);
  if (!current) return null;

  const result = await db.query(
    `UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );

  await logActivity(id, userId, 'status_aenderung', `Status: ${current.status} → ${status}`, {
    old_status: current.status,
    new_status: status,
  });

  return result.rows[0];
}

export async function assign(id: string, assignedTo: string | null, userId: string) {
  const result = await db.query(
    `UPDATE leads SET assigned_to = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [assignedTo, id]
  );

  if (result.rows[0]) {
    const assignedName = assignedTo
      ? (await db.query('SELECT name FROM users WHERE id = $1', [assignedTo])).rows[0]?.name
      : 'Niemand';
    await logActivity(id, userId, 'zuweisung', `Zugewiesen an: ${assignedName}`, {
      assigned_to: assignedTo,
    });
  }

  return result.rows[0] || null;
}

export async function getActivities(leadId: string) {
  const result = await db.query(
    `SELECT la.*, u.name as user_name
     FROM lead_activities la
     JOIN users u ON la.user_id = u.id
     WHERE la.lead_id = $1
     ORDER BY la.created_at DESC`,
    [leadId]
  );
  return result.rows;
}

export async function addActivity(leadId: string, userId: string, type: string, description: string) {
  await logActivity(leadId, userId, type, description);
  await db.query('UPDATE leads SET updated_at = NOW() WHERE id = $1', [leadId]);
  return { success: true };
}

async function logActivity(leadId: string, userId: string, type: string, description: string, metadata?: Record<string, unknown>) {
  await db.query(
    `INSERT INTO lead_activities (lead_id, user_id, type, description, metadata)
     VALUES ($1, $2, $3::activity_type, $4, $5)`,
    [leadId, userId, type, description, metadata ? JSON.stringify(metadata) : null]
  );
}

// Lock management
export async function acquireLock(leadId: string, userId: string) {
  // Clean expired locks
  await db.query('DELETE FROM lead_locks WHERE expires_at < NOW()');

  // Check existing lock
  const existing = await db.query(
    `SELECT ll.*, u.name as user_name FROM lead_locks ll
     JOIN users u ON ll.user_id = u.id
     WHERE ll.lead_id = $1`,
    [leadId]
  );

  if (existing.rows[0]) {
    if (existing.rows[0].user_id === userId) {
      // Renew own lock
      await db.query(
        `UPDATE lead_locks SET expires_at = NOW() + INTERVAL '5 minutes' WHERE lead_id = $1`,
        [leadId]
      );
      return { locked: true, own: true };
    }
    return { locked: false, locked_by: existing.rows[0].user_name };
  }

  // Acquire new lock
  await db.query(
    `INSERT INTO lead_locks (lead_id, user_id) VALUES ($1, $2)`,
    [leadId, userId]
  );
  return { locked: true, own: true };
}

export async function releaseLock(leadId: string, userId: string) {
  await db.query(
    'DELETE FROM lead_locks WHERE lead_id = $1 AND user_id = $2',
    [leadId, userId]
  );
  return { released: true };
}

export async function getAllLocks() {
  await db.query('DELETE FROM lead_locks WHERE expires_at < NOW()');
  const result = await db.query(
    `SELECT ll.lead_id, ll.user_id, u.name as user_name, ll.expires_at
     FROM lead_locks ll
     JOIN users u ON ll.user_id = u.id`
  );
  return result.rows;
}

// Excel import
const importCache = new Map<string, { headers: string[]; rows: string[][]; total: number }>();

export async function parseImport(headers: string[], rows: string[][]) {
  const importId = crypto.randomUUID();
  importCache.set(importId, { headers, rows, total: rows.length });

  // Clean old imports after 30 minutes
  setTimeout(() => importCache.delete(importId), 30 * 60 * 1000);

  return {
    import_id: importId,
    headers,
    preview_rows: rows.slice(0, 10),
    total_rows: rows.length,
  };
}

export async function confirmImport(importId: string, columnMapping: Record<string, number>, userId: string) {
  const cached = importCache.get(importId);
  if (!cached) throw new Error('Import-Sitzung abgelaufen. Bitte die Datei erneut hochladen.');

  const fieldNames = ['company_name', 'contact_person', 'email', 'phone', 'website', 'address', 'city', 'postal_code', 'bundesland'];
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    for (let i = 0; i < cached.rows.length; i++) {
      const row = cached.rows[i];
      const mapped: Record<string, string> = {};

      for (const field of fieldNames) {
        if (columnMapping[field] !== undefined && columnMapping[field] >= 0) {
          mapped[field] = row[columnMapping[field]] || '';
        }
      }

      // Clean placeholder values (-, Keine, etc.) → treat as empty
      const placeholders = ['-', '–', '—', 'k.a.', 'n/a', 'keine', 'minimal', 'nur verzeichnis'];
      for (const key of Object.keys(mapped)) {
        if (mapped[key] && placeholders.includes(mapped[key].toLowerCase().trim())) {
          mapped[key] = '';
        }
      }

      // Auto-split combined PLZ/Ort values like "21435 Stelle" or "21435 Neu Wulmstorf"
      if (mapped.city && !mapped.postal_code) {
        const plzMatch = mapped.city.match(/^(\d{4,5})\s+(.+)$/);
        if (plzMatch) {
          mapped.postal_code = plzMatch[1];
          mapped.city = plzMatch[2];
        }
      }
      if (mapped.postal_code && !mapped.city) {
        const plzMatch = mapped.postal_code.match(/^(\d{4,5})\s+(.+)$/);
        if (plzMatch) {
          mapped.postal_code = plzMatch[1];
          mapped.city = plzMatch[2];
        }
      }

      if (!mapped.company_name?.trim()) {
        skipped++;
        errors.push(`Zeile ${i + 2}: Firmenname fehlt`);
        continue;
      }

      const result = await client.query(
        `INSERT INTO leads (company_name, contact_person, email, phone, website, address, city, postal_code, bundesland, source, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Excel-Import', $10)
         RETURNING id`,
        [mapped.company_name.trim(), mapped.contact_person || null, mapped.email || null,
         mapped.phone || null, mapped.website || null, mapped.address || null,
         mapped.city || null, mapped.postal_code || null, mapped.bundesland || null, userId]
      );

      await client.query(
        `INSERT INTO lead_activities (lead_id, user_id, type, description)
         VALUES ($1, $2, 'import', 'Importiert aus Excel')`,
        [result.rows[0].id, userId]
      );

      imported++;
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  importCache.delete(importId);
  return { imported, skipped, errors };
}

// Convert lead to customer
export interface ConvertOverrides {
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
  assigned_to?: string | null;
}

export async function convertToCustomer(leadId: string, userId: string, overrides?: ConvertOverrides) {
  const lead = await getById(leadId);
  if (!lead) throw new Error('Lead nicht gefunden');
  if (lead.status === 'gewonnen') throw new Error('Lead wurde bereits konvertiert');

  // Use overrides if provided, otherwise fall back to lead data
  const data = {
    company_name: overrides?.company_name || lead.company_name,
    contact_person: overrides?.contact_person !== undefined ? overrides.contact_person : lead.contact_person,
    email: overrides?.email !== undefined ? overrides.email : lead.email,
    phone: overrides?.phone !== undefined ? overrides.phone : lead.phone,
    website: overrides?.website !== undefined ? overrides.website : lead.website,
    address: overrides?.address !== undefined ? overrides.address : lead.address,
    city: overrides?.city !== undefined ? overrides.city : lead.city,
    postal_code: overrides?.postal_code !== undefined ? overrides.postal_code : lead.postal_code,
    notes: overrides?.notes !== undefined ? overrides.notes : lead.notes,
    assigned_to: overrides?.assigned_to !== undefined ? overrides.assigned_to : lead.assigned_to,
  };

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO customers (lead_id, company_name, contact_person, email, phone, website, address, city, postal_code, notes, assigned_to, converted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [leadId, data.company_name, data.contact_person, data.email, data.phone,
       data.website, data.address, data.city, data.postal_code, data.notes,
       data.assigned_to, userId]
    );

    await client.query(
      `UPDATE leads SET status = 'gewonnen', updated_at = NOW() WHERE id = $1`,
      [leadId]
    );

    await client.query(
      `INSERT INTO lead_activities (lead_id, user_id, type, description)
       VALUES ($1, $2, 'konvertiert', 'Lead in Kunde umgewandelt')`,
      [leadId, userId]
    );

    // Release any lock
    await client.query('DELETE FROM lead_locks WHERE lead_id = $1', [leadId]);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
