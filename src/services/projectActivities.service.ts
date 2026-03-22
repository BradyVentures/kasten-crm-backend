import { db } from '../config/database.js';

export async function getByProject(projectId: string, limit = 50) {
  const result = await db.query(
    `SELECT pa.*,
            u.name as user_name
     FROM project_activities pa
     LEFT JOIN users u ON pa.user_id = u.id
     WHERE pa.project_id = $1
     ORDER BY pa.created_at DESC
     LIMIT $2`,
    [projectId, limit]
  );
  return result.rows;
}

export async function create(
  projectId: string,
  userId: string,
  type: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  const result = await db.query(
    `INSERT INTO project_activities (project_id, user_id, type, description, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [projectId, userId, type, description, metadata ? JSON.stringify(metadata) : null]
  );
  return result.rows[0];
}

export async function log(
  projectId: string,
  userId: string,
  type: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  return create(projectId, userId, type, description, metadata);
}
