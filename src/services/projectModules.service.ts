import { db } from '../config/database.js';
import * as projectsService from './projects.service.js';

export async function getByProject(projectId: string) {
  const result = await db.query(
    `SELECT * FROM project_modules
     WHERE project_id = $1
     ORDER BY phase ASC NULLS LAST, sort_order ASC`,
    [projectId]
  );
  return result.rows;
}

export async function create(projectId: string, data: {
  name: string;
  category: string;
  description?: string;
  setup_cost_internal?: number;
  setup_price_customer?: number;
  monthly_cost_internal?: number;
  monthly_price_customer?: number;
  estimated_hours?: number;
  complexity?: string;
  phase?: number;
  estimated_weeks?: number;
  tech_stack?: string;
  dependencies?: string;
  risks?: string;
  dsgvo_notes?: string;
  sort_order?: number;
}) {
  const result = await db.query(
    `INSERT INTO project_modules (project_id, name, category, description, setup_cost_internal, setup_price_customer, monthly_cost_internal, monthly_price_customer, estimated_hours, complexity, phase, estimated_weeks, tech_stack, dependencies, risks, dsgvo_notes, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING *`,
    [
      projectId,
      data.name,
      data.category,
      data.description || null,
      data.setup_cost_internal ?? 0,
      data.setup_price_customer ?? 0,
      data.monthly_cost_internal ?? 0,
      data.monthly_price_customer ?? 0,
      data.estimated_hours ?? null,
      data.complexity || 'mittel',
      data.phase ?? 1,
      data.estimated_weeks ?? null,
      data.tech_stack || null,
      data.dependencies || null,
      data.risks || null,
      data.dsgvo_notes || null,
      data.sort_order ?? 0,
    ]
  );

  await projectsService.recalculate(projectId);
  return result.rows[0];
}

export async function update(moduleId: string, data: Record<string, unknown>) {
  const moduleResult = await db.query('SELECT project_id FROM project_modules WHERE id = $1', [moduleId]);
  if (moduleResult.rows.length === 0) return null;
  const projectId = moduleResult.rows[0].project_id;

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
  params.push(moduleId);

  const result = await db.query(
    `UPDATE project_modules SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );

  if (result.rows[0]) {
    await projectsService.recalculate(projectId);
  }

  return result.rows[0] || null;
}

export async function remove(moduleId: string) {
  const moduleResult = await db.query('SELECT project_id FROM project_modules WHERE id = $1', [moduleId]);
  if (moduleResult.rows.length === 0) return false;
  const projectId = moduleResult.rows[0].project_id;

  const result = await db.query('DELETE FROM project_modules WHERE id = $1', [moduleId]);
  const deleted = (result.rowCount || 0) > 0;

  if (deleted) {
    await projectsService.recalculate(projectId);
  }

  return deleted;
}

export async function reorder(projectId: string, items: { id: string; sort_order: number; phase?: number }[]) {
  for (const item of items) {
    if (item.phase !== undefined) {
      await db.query(
        'UPDATE project_modules SET sort_order = $1, phase = $2, updated_at = NOW() WHERE id = $3 AND project_id = $4',
        [item.sort_order, item.phase, item.id, projectId]
      );
    } else {
      await db.query(
        'UPDATE project_modules SET sort_order = $1, updated_at = NOW() WHERE id = $2 AND project_id = $3',
        [item.sort_order, item.id, projectId]
      );
    }
  }

  return getByProject(projectId);
}
