import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { User, JwtPayload } from '../types/index.js';

export async function login(email: string, password: string) {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1 AND is_active = true',
    [email]
  );

  const user = result.rows[0] as User | undefined;
  if (!user) {
    throw new Error('Ungültige Anmeldedaten');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error('Ungültige Anmeldedaten');
  }

  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function getMe(userId: string) {
  const result = await db.query(
    'SELECT id, email, name, role, is_active, created_at FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
}
