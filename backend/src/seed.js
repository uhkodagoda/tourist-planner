// Creates (or updates) the single administrator account from .env values.
// Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function run() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hash = await bcrypt.hash(password, 10);

  try {
    const [existing] = await pool.query('SELECT admin_id FROM admins WHERE username = ?', [username]);

    if (existing.length > 0) {
      await pool.query('UPDATE admins SET password_hash = ? WHERE username = ?', [hash, username]);
      console.log(`Admin user "${username}" already existed — password refreshed from .env.`);
    } else {
      await pool.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, hash]);
      console.log(`Admin user "${username}" created.`);
    }
  } catch (err) {
    console.error('Failed to seed admin user:', err.message);
    console.error('Make sure you have run db/schema.sql and db/seed.sql first, and that .env is configured.');
    process.exit(1);
  }

  process.exit(0);
}

run();
