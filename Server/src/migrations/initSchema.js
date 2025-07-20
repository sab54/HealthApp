const db = require('../config/db');

function initSchema() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT,
        email TEXT UNIQUE,
        phone_number TEXT NOT NULL,
        country_code TEXT DEFAULT '+91',
        city TEXT,
        state TEXT,
        country TEXT,
        latitude REAL,
        longitude REAL,
        is_phone_verified INTEGER DEFAULT 0,
        role TEXT DEFAULT 'patient',
        is_approved INTEGER DEFAULT 0
      )
    `);

    // OTP Logins table
    db.run(`
      CREATE TABLE IF NOT EXISTS otp_logins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        otp_code TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        is_used INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 5,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS doctor_licenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    console.log('✅ Tables created or already exist.');
  });
}

module.exports = initSchema;
