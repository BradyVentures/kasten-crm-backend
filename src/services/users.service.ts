import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';

export async function getAll() {
  const result = await db.query(
    'SELECT id, email, name, role, is_active, created_at FROM users ORDER BY name ASC'
  );
  return result.rows;
}

export async function create(data: { email: string; password: string; name: string; role?: string }) {
  const hash = await bcrypt.hash(data.password, 12);
  const result = await db.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4::user_role)
     RETURNING id, email, name, role, is_active, created_at`,
    [data.email, hash, data.name, data.role || 'employee']
  );
  return result.rows[0];
}

export async function update(id: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (key === 'role') {
        fields.push(`${key} = $${paramIndex}::user_role`);
      } else {
        fields.push(`${key} = $${paramIndex}`);
      }
      params.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) return null;

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await db.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}
     RETURNING id, email, name, role, is_active, created_at`,
    params
  );
  return result.rows[0] || null;
}

export async function resetPassword(id: string, password: string) {
  const hash = await bcrypt.hash(password, 12);
  const result = await db.query(
    `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2
     RETURNING id, email, name, role`,
    [hash, id]
  );
  return result.rows[0] || null;
}
