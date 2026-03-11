import { db } from '../config/database.js';

export async function getAll(category?: string) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (category) {
    conditions.push(`d.category = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT d.*, u.name as uploaded_by_name
     FROM documents d
     LEFT JOIN users u ON d.uploaded_by = u.id
     ${where}
     ORDER BY d.category ASC, d.created_at DESC`,
    params
  );
  return result.rows;
}

export async function getById(id: string) {
  const result = await db.query(
    `SELECT d.*, u.name as uploaded_by_name
     FROM documents d
     LEFT JOIN users u ON d.uploaded_by = u.id
     WHERE d.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function create(data: {
  title: string;
  description?: string;
  category: string;
  file_path: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
}) {
  const result = await db.query(
    `INSERT INTO documents (title, description, category, file_path, original_name, file_size, mime_type, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [data.title, data.description || null, data.category, data.file_path,
     data.original_name, data.file_size, data.mime_type, data.uploaded_by]
  );
  return result.rows[0];
}

export async function remove(id: string) {
  const result = await db.query(
    'DELETE FROM documents WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}
