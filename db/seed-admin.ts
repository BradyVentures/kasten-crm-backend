import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const password = 'Bradydig/4321';
  const hash = await bcrypt.hash(password, 12);

  try {
    // Check if user already exists
    const existing = await pool.query("SELECT id FROM users WHERE email = 'daryl@brady-digital.com'");

    if (existing.rows.length > 0) {
      // Update existing user's password
      await pool.query(
        "UPDATE users SET password_hash = $1, role = 'admin', is_active = true WHERE email = 'daryl@brady-digital.com'",
        [hash]
      );
      console.log('✓ Admin-User aktualisiert: daryl@brady-digital.com');
    } else {
      // Create new admin user
      await pool.query(
        "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'admin')",
        ['daryl@brady-digital.com', hash, 'Daryl Brady']
      );
      console.log('✓ Admin-User erstellt: daryl@brady-digital.com');
    }

    console.log('  Passwort: Bradydig/4321');
  } catch (err) {
    console.error('Fehler:', err);
  } finally {
    await pool.end();
  }
}

seedAdmin();
