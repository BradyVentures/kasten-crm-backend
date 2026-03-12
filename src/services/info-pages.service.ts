import { db } from '../config/database.js';

export async function getAll() {
  const result = await db.query(
    `SELECT ip.*, u.name as updated_by_name
     FROM info_pages ip
     LEFT JOIN users u ON ip.updated_by = u.id
     ORDER BY ip.sort_order ASC`
  );
  return result.rows;
}

export async function getBySlug(slug: string) {
  const result = await db.query(
    `SELECT ip.*, u.name as updated_by_name
     FROM info_pages ip
     LEFT JOIN users u ON ip.updated_by = u.id
     WHERE ip.slug = $1`,
    [slug]
  );
  return result.rows[0] || null;
}

export async function update(slug: string, content: string, userId: string) {
  const result = await db.query(
    `UPDATE info_pages SET content = $1, updated_by = $2, updated_at = NOW()
     WHERE slug = $3 RETURNING *`,
    [content, userId, slug]
  );
  return result.rows[0] || null;
}
