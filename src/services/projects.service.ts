import { db } from '../config/database.js';
import * as activitiesService from './projectActivities.service.js';

export async function getAll(filters: {
  status?: string;
  customer_id?: string;
  assigned_to?: string;
  search?: string;
}) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.status) {
    conditions.push(`p.status = $${idx}`);
    params.push(filters.status);
    idx++;
  }

  if (filters.customer_id) {
    conditions.push(`p.customer_id = $${idx}`);
    params.push(filters.customer_id);
    idx++;
  }

  if (filters.assigned_to) {
    conditions.push(`p.assigned_to = $${idx}`);
    params.push(filters.assigned_to);
    idx++;
  }

  if (filters.search) {
    conditions.push(`(p.title ILIKE $${idx} OR p.prospect_name ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT p.*,
            c.company_name as customer_name,
            u.name as assigned_to_name,
            (SELECT COUNT(*) FROM project_modules pm WHERE pm.project_id = p.id) as module_count
     FROM projects p
     LEFT JOIN customers c ON p.customer_id = c.id
     LEFT JOIN users u ON p.assigned_to = u.id
     ${where}
     ORDER BY p.updated_at DESC`,
    params
  );

  return result.rows;
}

export async function getById(id: string) {
  const projectResult = await db.query(
    `SELECT p.*,
            c.company_name as customer_name,
            c.contact_person as customer_contact,
            c.email as customer_email,
            c.phone as customer_phone,
            u.name as assigned_to_name
     FROM projects p
     LEFT JOIN customers c ON p.customer_id = c.id
     LEFT JOIN users u ON p.assigned_to = u.id
     WHERE p.id = $1`,
    [id]
  );

  if (projectResult.rows.length === 0) return null;

  const project = projectResult.rows[0];

  const [modulesResult, documentsResult, activitiesResult] = await Promise.all([
    db.query(
      `SELECT * FROM project_modules WHERE project_id = $1 ORDER BY phase ASC NULLS LAST, sort_order ASC`,
      [id]
    ),
    db.query(
      `SELECT * FROM project_documents WHERE project_id = $1 ORDER BY created_at DESC`,
      [id]
    ),
    db.query(
      `SELECT pa.*, u.name as user_name
       FROM project_activities pa
       LEFT JOIN users u ON pa.user_id = u.id
       WHERE pa.project_id = $1
       ORDER BY pa.created_at DESC
       LIMIT 20`,
      [id]
    ),
  ]);

  return {
    ...project,
    modules: modulesResult.rows,
    documents: documentsResult.rows,
    activities: activitiesResult.rows,
  };
}

export async function create(data: {
  title: string;
  customer_id?: string;
  prospect_name?: string;
  prospect_contact?: string;
  prospect_email?: string;
  prospect_phone?: string;
  description?: string;
  status?: string;
  estimated_start?: string;
  estimated_end?: string;
  assigned_to?: string;
}, userId: string) {
  const result = await db.query(
    `INSERT INTO projects (title, customer_id, prospect_name, prospect_contact, prospect_email, prospect_phone, description, status, estimated_start, estimated_end, assigned_to, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      data.title,
      data.customer_id || null,
      data.prospect_name || null,
      data.prospect_contact || null,
      data.prospect_email || null,
      data.prospect_phone || null,
      data.description || null,
      data.status || 'entwurf',
      data.estimated_start || null,
      data.estimated_end || null,
      data.assigned_to || null,
      userId,
    ]
  );

  const project = result.rows[0];
  await activitiesService.log(project.id, userId, 'erstellt', 'Projekt erstellt');

  return project;
}

export async function update(id: string, data: Record<string, unknown>, userId: string) {
  // Check current status for activity logging
  const currentResult = await db.query('SELECT status FROM projects WHERE id = $1', [id]);
  if (currentResult.rows.length === 0) return null;
  const oldStatus = currentResult.rows[0].status;

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
    `UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );

  const project = result.rows[0];
  if (!project) return null;

  // Log status change if applicable
  if (data.status && data.status !== oldStatus) {
    await activitiesService.log(
      id,
      userId,
      'status_aenderung',
      `Status geändert: ${oldStatus} → ${data.status}`,
      { old_status: oldStatus, new_status: data.status }
    );
  }

  return project;
}

export async function updateStatus(id: string, status: string, userId: string) {
  const currentResult = await db.query('SELECT status FROM projects WHERE id = $1', [id]);
  if (currentResult.rows.length === 0) return null;
  const oldStatus = currentResult.rows[0].status;

  const result = await db.query(
    `UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );

  const project = result.rows[0];
  if (!project) return null;

  await activitiesService.log(
    id,
    userId,
    'status_aenderung',
    `Status geändert: ${oldStatus} → ${status}`,
    { old_status: oldStatus, new_status: status }
  );

  return project;
}

export async function remove(id: string) {
  const currentResult = await db.query('SELECT status FROM projects WHERE id = $1', [id]);
  if (currentResult.rows.length === 0) return false;

  if (currentResult.rows[0].status !== 'entwurf') {
    throw new Error('Nur Projekte im Status "entwurf" können gelöscht werden');
  }

  const result = await db.query('DELETE FROM projects WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}

export async function recalculate(id: string) {
  const result = await db.query(
    `UPDATE projects SET
       total_setup_cost_internal = COALESCE((SELECT SUM(COALESCE(setup_cost_internal, 0)) FROM project_modules WHERE project_id = $1), 0),
       total_setup_price_customer = COALESCE((SELECT SUM(COALESCE(setup_price_customer, 0)) FROM project_modules WHERE project_id = $1), 0),
       total_monthly_cost_internal = COALESCE((SELECT SUM(COALESCE(monthly_cost_internal, 0)) FROM project_modules WHERE project_id = $1), 0),
       total_monthly_price_customer = COALESCE((SELECT SUM(COALESCE(monthly_price_customer, 0)) FROM project_modules WHERE project_id = $1), 0),
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

export async function createFromTemplate(templateId: string, data: {
  title: string;
  customer_id?: string;
  prospect_name?: string;
  prospect_contact?: string;
  prospect_email?: string;
  prospect_phone?: string;
  description?: string;
  assigned_to?: string;
}, userId: string) {
  // Get template
  const templateResult = await db.query(
    'SELECT * FROM project_templates WHERE id = $1',
    [templateId]
  );
  if (templateResult.rows.length === 0) {
    throw new Error('Template nicht gefunden');
  }

  // Create project
  const project = await create(data, userId);
  const template = templateResult.rows[0];

  // Parse modules from JSONB
  const modules = typeof template.modules_json === 'string'
    ? JSON.parse(template.modules_json)
    : template.modules_json || [];

  // Insert modules
  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    await db.query(
      `INSERT INTO project_modules (project_id, name, category, description, setup_cost_internal, setup_price_customer, monthly_cost_internal, monthly_price_customer, estimated_hours, complexity, phase, estimated_weeks, tech_stack, dependencies, risks, dsgvo_notes, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        project.id,
        mod.name,
        mod.category,
        mod.description || null,
        mod.setup_cost_internal ?? 0,
        mod.setup_price_customer ?? 0,
        mod.monthly_cost_internal ?? 0,
        mod.monthly_price_customer ?? 0,
        mod.estimated_hours ?? null,
        mod.complexity || 'mittel',
        mod.phase ?? (i + 1),
        mod.estimated_weeks ?? null,
        mod.tech_stack || null,
        mod.dependencies || null,
        mod.risks || null,
        mod.dsgvo_notes || null,
        i,
      ]
    );
  }

  // Recalculate totals
  await recalculate(project.id);

  await activitiesService.log(
    project.id,
    userId,
    'erstellt',
    `Projekt aus Template "${templateResult.rows[0].name}" erstellt`
  );

  return getById(project.id);
}
