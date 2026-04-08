import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://daryl@localhost:5432/bauelemente_kasten',
  });

  try {
    // Admin user (Brady Digital)
    const adminPassword = 'admin1234';
    const adminHash = await bcrypt.hash(adminPassword, 12);

    const existing = await pool.query("SELECT id FROM users WHERE email = 'admin@bauelemente-kasten.de'");

    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE users SET password_hash = $1, role = 'admin', is_active = true WHERE email = 'admin@bauelemente-kasten.de'",
        [adminHash]
      );
      console.log('Admin-User aktualisiert: admin@bauelemente-kasten.de');
    } else {
      await pool.query(
        "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'admin')",
        ['admin@bauelemente-kasten.de', adminHash, 'Olaf Kasten']
      );
      console.log('Admin-User erstellt: admin@bauelemente-kasten.de');
    }

    console.log('  Passwort: admin1234');
  } catch (err) {
    console.error('Fehler:', err);
  } finally {
    await pool.end();
  }
}

seedAdmin();
