import { db } from '../config/database.js';
import path from 'path';
import fs from 'fs';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function getByProject(projectId: string) {
  const result = await db.query(
    `SELECT pd.*, u.name as uploaded_by_name
     FROM project_documents pd
     LEFT JOIN users u ON pd.uploaded_by = u.id
     WHERE pd.project_id = $1
     ORDER BY pd.created_at DESC`,
    [projectId]
  );
  return result.rows;
}

export async function upload(projectId: string, file: Express.Multer.File, documentType: string, userId: string) {
  const projectDir = path.join(UPLOADS_DIR, projectId);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  const ext = path.extname(file.originalname);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const storagePath = path.join(projectId, filename);
  const fullPath = path.join(UPLOADS_DIR, storagePath);

  fs.writeFileSync(fullPath, file.buffer);

  const result = await db.query(
    `INSERT INTO project_documents (project_id, document_type, filename, original_name, mime_type, file_size, storage_path, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [projectId, documentType, filename, file.originalname, file.mimetype, file.size, storagePath, userId]
  );
  return result.rows[0];
}

export async function getFilePath(documentId: string) {
  const result = await db.query('SELECT * FROM project_documents WHERE id = $1', [documentId]);
  if (!result.rows[0]) return null;
  return {
    fullPath: path.join(UPLOADS_DIR, result.rows[0].storage_path),
    originalName: result.rows[0].original_name,
    mimeType: result.rows[0].mime_type,
  };
}

export async function remove(documentId: string, projectId: string) {
  const doc = await db.query('SELECT storage_path FROM project_documents WHERE id = $1 AND project_id = $2', [documentId, projectId]);
  if (!doc.rows[0]) return false;

  const fullPath = path.join(UPLOADS_DIR, doc.rows[0].storage_path);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

  await db.query('DELETE FROM project_documents WHERE id = $1', [documentId]);
  return true;
}

export async function updateExtractedData(documentId: string, data: Record<string, unknown>) {
  const result = await db.query(
    'UPDATE project_documents SET extracted_data = $1 WHERE id = $2 RETURNING *',
    [JSON.stringify(data), documentId]
  );
  return result.rows[0] || null;
}
