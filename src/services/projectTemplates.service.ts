import { db } from '../config/database.js';

export async function getAll() {
  const result = await db.query(
    `SELECT pt.*,
            u.name as created_by_name,
            (SELECT COUNT(*) FROM project_template_modules ptm WHERE ptm.template_id = pt.id) as module_count
     FROM project_templates pt
     LEFT JOIN users u ON pt.created_by = u.id
     WHERE pt.is_active = true
     ORDER BY pt.name ASC`
  );
  return result.rows;
}

export async function create(data: {
  name: string;
  description?: string;
  default_modules?: Array<{
    name: string;
    category: string;
    description?: string;
    internal_cost?: number;
    external_cost?: number;
    price?: number;
    hourly_rate?: number;
    estimated_hours?: number;
    complexity?: string;
    phase?: string;
    estimated_weeks?: number;
    tech_stack?: string;
    dependencies?: string;
    risks?: string;
    dsgvo_notes?: string;
    sort_order?: number;
  }>;
}, userId: string) {
  const result = await db.query(
    `INSERT INTO project_templates (name, description, created_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.name, data.description || null, userId]
  );

  const template = result.rows[0];

  if (data.default_modules && data.default_modules.length > 0) {
    for (const mod of data.default_modules) {
      await db.query(
        `INSERT INTO project_template_modules (template_id, name, category, description, internal_cost, external_cost, price, hourly_rate, estimated_hours, complexity, phase, estimated_weeks, tech_stack, dependencies, risks, dsgvo_notes, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          template.id,
          mod.name,
          mod.category,
          mod.description || null,
          mod.internal_cost ?? null,
          mod.external_cost ?? null,
          mod.price ?? null,
          mod.hourly_rate ?? null,
          mod.estimated_hours ?? null,
          mod.complexity || null,
          mod.phase || null,
          mod.estimated_weeks ?? null,
          mod.tech_stack || null,
          mod.dependencies || null,
          mod.risks || null,
          mod.dsgvo_notes || null,
          mod.sort_order ?? 0,
        ]
      );
    }
  }

  return template;
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
