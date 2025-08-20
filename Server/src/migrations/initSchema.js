// Server/src/migrations/initSchema.js
const db = require('../config/db');

function initSchema() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        country_code TEXT DEFAULT '+44',
        email TEXT UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT,
        date_of_birth TEXT,
        gender TEXT CHECK(gender IN ('male', 'female', 'other')) DEFAULT 'other',
        address_line1 TEXT,
        address_line2 TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT,
        profile_picture_url TEXT,
        is_phone_verified INTEGER DEFAULT 0,
        role TEXT CHECK(role IN ('user', 'doctor')) NOT NULL,
        is_active INTEGER DEFAULT 1,
        is_approved INTEGER DEFAULT 0,
        latitude REAL DEFAULT NULL,
        longitude REAL DEFAULT NULL,
        created_by INTEGER DEFAULT NULL, -- ID of admin who created this user
        updated_by INTEGER DEFAULT NULL, -- ID of admin who last updated this user
        created_at TEXT DEFAULT (datetime('now')), -- Timestamp in ISO format
        updated_at TEXT DEFAULT (datetime('now')), -- Updated manually in app logic
        deleted_at TEXT DEFAULT NULL, -- Soft delete timestamp
        UNIQUE(country_code, phone_number)
        )
    `);

    db.run(`
  INSERT OR IGNORE INTO users (
    phone_number,
    country_code,
    email,
    first_name,
    last_name,
    date_of_birth,
    gender,
    address_line1,
    city,
    state,
    postal_code,
    country,
    is_phone_verified,
    role,
    is_active,
    is_approved,
    created_by,
    updated_by,
    created_at
  ) VALUES (
    '9999999999',
    '+44',
    'laura.murphy@example.com',
    'Laura',
    'Murphy',
    '2004-08-10',
    'female',
    '13 Example Street',
    'Birmingham',
    'Borough',
    'M1 2BB',
    'United Kingdom',
    1,
    'user',
    1,
    1,
    NULL,
    NULL,
    '2025-08-19 00:00:00'
  )
`);



    db.run(`
      CREATE TABLE IF NOT EXISTS user_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT CHECK(type IN ('chat', 'task', 'quiz', 'system', 'emergency')) NOT NULL,
        related_id INTEGER,
        title TEXT,
        message TEXT,
        is_read INTEGER DEFAULT 0,
        urgency TEXT CHECK(urgency IN ('severe', 'moderate', 'advisory')),
        latitude REAL DEFAULT NULL,
        longitude REAL DEFAULT NULL,
        radius_km REAL DEFAULT NULL,
        source TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

    // Doctor Licenses table
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

    // Chat table

    db.run(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        is_group INTEGER DEFAULT 0,
        name TEXT DEFAULT NULL,
        latitude REAL DEFAULT NULL,
        longitude REAL DEFAULT NULL,
        radius_km REAL DEFAULT NULL,
        created_by INTEGER DEFAULT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
`);

    // Chat Members table
    db.run(`
  CREATE TABLE IF NOT EXISTS chat_members (
    chat_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT CHECK(role IN ('member', 'admin', 'owner')) DEFAULT 'member',
    joined_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (chat_id, user_id),
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

    // Chat Messages table
    db.run(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    sender_id INTEGER DEFAULT NULL,
    message TEXT NOT NULL,
    message_type TEXT CHECK(message_type IN (
      'text', 'image', 'file', 'location', 'poll', 'quiz', 'task', 'info', 'event'
    )) DEFAULT 'text',
    created_at TEXT DEFAULT (datetime('now')),
    edited_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    edited_by INTEGER DEFAULT NULL,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE SET NULL
  )
`);

    // Chat Attachments table
    db.run(`
  CREATE TABLE IF NOT EXISTS chat_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    thumbnail_url TEXT,
    uploaded_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
  )
`);

    // Chat Read Receipts table
    db.run(`
  CREATE TABLE IF NOT EXISTS chat_read_receipts (
    chat_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    read_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (chat_id, user_id),
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
  )
`);

    // Group Metadata table
    db.run(`
  CREATE TABLE IF NOT EXISTS group_metadata (
    chat_id INTEGER PRIMARY KEY,
    icon_url TEXT,
    description TEXT,
    rules TEXT,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
  )
`);

    db.run(`
  CREATE TABLE IF NOT EXISTS user_daily_mood (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    mood TEXT NOT NULL CHECK(mood IN ('Feeling great!', 'Not feeling good!')),
    sleep REAL,
    energy REAL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(user_id, date)
  )
`);

    db.run(`
      INSERT OR IGNORE INTO user_daily_mood (user_id, date, mood, sleep, energy)
      VALUES (1, '2025-08-18', 'Feeling great!', 8, 9)
    `);

    db.run(`
      INSERT OR IGNORE INTO user_daily_mood (user_id, date, mood, sleep, energy)
      VALUES (1, '2025-08-19', 'Not feeling good!', 4.5, 3)
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS user_symptoms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        symptom TEXT NOT NULL,
        severity TEXT NOT NULL CHECK(severity IN ('mild', 'moderate', 'severe')),
        onset_time TEXT NOT NULL,
        duration TEXT,
        notes TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        recovered_at TEXT DEFAULT NULL,  -- new column
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id)
  )
      `);

    // Recovery Tasks
    db.run(`
  CREATE TABLE IF NOT EXISTS user_daily_plan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symptom TEXT NOT NULL,
    category TEXT NOT NULL, -- precautions, what_to_eat, medicines, what_not_to_take, exercises, treatment
    task TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    date TEXT NOT NULL, -- to separate daily plans
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);
    console.log('Tables created or already exist.');
  });
}

module.exports = initSchema;
