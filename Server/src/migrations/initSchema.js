// Server/src/migrations/initSchema.js
/**
 * initSchema.js
 *
 * This script initializes the database schema by creating the necessary tables to store data for various
 * features of the application, including user details, chat messages, appointments, user moods, and daily steps.
 * It ensures that all required tables exist before any data is inserted, and if they do exist, they remain intact
 * (i.e., no overwriting or deletion of data).
 *
 * Tables Created:
 * 1. **users**: Stores user information such as personal details, role, verification status, etc.
 * 2. **user_alerts**: Stores notifications or alerts for users (e.g., chat messages, tasks, system alerts).
 * 3. **otp_logins**: Stores OTP information for login attempts, including the status and expiration.
 * 4. **doctor_licenses**: Stores doctor license information, including file paths and status of verification.
 * 5. **chats**: Stores chat group information, such as group details and creation data.
 * 6. **chat_members**: Stores chat membership details, linking users to chats with roles.
 * 7. **chat_messages**: Stores messages exchanged in the chat, including sender info, message type, and timestamps.
 * 8. **chat_attachments**: Stores attachments related to chat messages, such as files and images.
 * 9. **chat_read_receipts**: Tracks which users have read which messages.
 * 10. **group_metadata**: Stores metadata for group chats (e.g., icon, rules).
 * 11. **appointments**: Stores information about appointments, including details about patients, doctors, and appointment statuses.
 * 12. **user_daily_mood**: Stores daily mood, energy, and sleep data for users.
 * 13. **user_symptoms**: Stores user-reported symptoms, their severity, and related information (e.g., recovery time).
 * 14. **user_daily_plan**: Stores tasks or recovery plans for users, based on their symptoms.
 * 15. **user_steps**: Stores daily step count and fitness data for users.
 *
 * Inserts Initial Data:
 * - **A sample user** is inserted into the `users` table to provide a starting point for development or testing.
 *
 * Notes:
 * - Each table is created with various constraints, including primary keys, foreign keys, unique constraints, and checks.
 * - The `created_at` and `updated_at` fields are automatically populated with the current timestamp to track record creation and updates.
 * - The `users` table includes fields for user details like phone number, email, address, etc., with certain fields marked as `NOT NULL`.
 * - Soft delete support is implemented in certain tables using fields like `deleted_at`, which allows for the removal of records without permanent deletion.
 *
 * This script uses SQLite and executes SQL commands in sequence to ensure that all necessary tables are created in the database.
 *
 * Author: [Your Name]
 */

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
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        deleted_at TEXT DEFAULT NULL, -- Soft delete timestamp
        UNIQUE(country_code, phone_number)
      )
    `);

    db.run(`
      INSERT OR IGNORE INTO users (
        phone_number, country_code, email, first_name, last_name,
        date_of_birth, gender, address_line1, city, state, postal_code, country,
        is_phone_verified, role, is_active, is_approved, created_at
      ) VALUES
      ('1111111111','+44','dr.sarah.johnson@example.com','Sarah','Johnson','1980-05-15','female','45 Medical Lane','London','Greater London','SW1A 1AA','United Kingdom',1,'doctor',1,1,'2025-08-19 00:00:00'),
      ('2222222222','+44','dr.michael.brown@example.com','Michael','Brown','1975-11-20','male','22 Clinic Road','Manchester','Greater Manchester','M1 3BB','United Kingdom',1,'doctor',1,0,'2025-08-19 00:00:00'),
      ('3333333333','+44','john.doe@example.com','John','Doe','1990-03-10','male','78 High Street','Leeds','West Yorkshire','LS1 4AB','United Kingdom',1,'user',1,0,'2025-08-19 00:00:00')
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

    db.run(`
      INSERT OR IGNORE INTO doctor_licenses (user_id, file_path, status, uploaded_at)
      VALUES
      ((SELECT id FROM users WHERE email = 'dr.sarah.johnson@example.com'),'sarah_license.pdf','verified','2025-08-20 09:00:00'),
      ((SELECT id FROM users WHERE email = 'dr.michael.brown@example.com'),'michael_license.pdf','pending','2025-08-20 09:30:00')
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
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
`);

    db.run(`
      INSERT OR IGNORE INTO chats (is_group, name, created_by, created_at)
      VALUES (0, NULL,(SELECT id FROM users WHERE email = 'john.doe@example.com'),'2025-08-20 08:00:00')
    `);

    // Chat Members table
    db.run(`
  CREATE TABLE IF NOT EXISTS chat_members (
    chat_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT CHECK(role IN ('member', 'admin', 'owner')) DEFAULT 'member',
    joined_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (chat_id, user_id),
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

    db.run(`
      INSERT OR IGNORE INTO chat_members (chat_id, user_id, role)
      VALUES
      ((SELECT id FROM chats WHERE created_by = (SELECT id FROM users WHERE email = 'john.doe@example.com') LIMIT 1),(SELECT id FROM users WHERE email = 'john.doe@example.com'),'member'),
      ((SELECT id FROM chats WHERE created_by = (SELECT id FROM users WHERE email = 'john.doe@example.com') LIMIT 1),(SELECT id FROM users WHERE email = 'dr.sarah.johnson@example.com'),'member')
    `);


    // Chat Messages table
    db.run(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    sender_id INTEGER DEFAULT NULL,
    message TEXT NOT NULL,
    message_type TEXT CHECK(message_type IN (
      'text', 'image', 'file', 'location', 'appointment'
    )) DEFAULT 'text',
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    edited_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    edited_by INTEGER DEFAULT NULL,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE SET NULL
  )
`);

    db.run(`
      INSERT OR IGNORE INTO chat_messages (chat_id, sender_id, message, message_type, created_at)
      VALUES
      ((SELECT id FROM chats WHERE created_by = (SELECT id FROM users WHERE email = 'john.doe@example.com') LIMIT 1),(SELECT id FROM users WHERE email = 'john.doe@example.com'),'Doctor, can I book an appointment on 1st Jan 2026 at 12:30PM?','text','2025-08-31 09:00:00'),
      ((SELECT id FROM chats WHERE created_by = (SELECT id FROM users WHERE email = 'john.doe@example.com') LIMIT 1),(SELECT id FROM users WHERE email = 'dr.sarah.johnson@example.com'),'📅 Appointment with "John Doe" scheduled for 2026-01-01 at 12:30','appointment','2025-08-31 09:05:00')
    `);

    // Chat Attachments table
    db.run(`
  CREATE TABLE IF NOT EXISTS chat_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    thumbnail_url TEXT,
    uploaded_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
  )
`);

    // Chat Read Receipts table
    db.run(`
  CREATE TABLE IF NOT EXISTS chat_read_receipts (
    chat_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    read_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
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
  CREATE TABLE IF NOT EXISTS appointment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,       -- the patient
    sender_id INTEGER,              -- the doctor
    chat_id INTEGER,                -- link to chat
    created_by INTEGER,             -- who booked the appointment
    date DATE NOT NULL,             -- real calendar date
    time TIME NOT NULL,             -- real clock time
    reason TEXT,
    mode TEXT DEFAULT 'Phone Call',
    status TEXT CHECK(status IN ('scheduled','completed','cancelled','rescheduled')) DEFAULT 'scheduled',
    cancellation_reason TEXT DEFAULT NULL, -- why cancelled
    cancelled_at DATETIME DEFAULT NULL,    -- when cancelled
    rescheduled_from INTEGER DEFAULT NULL, -- old appointment id if rescheduled
    created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(chat_id) REFERENCES chats(id),
    FOREIGN KEY(created_by) REFERENCES users(id),
    FOREIGN KEY(rescheduled_from) REFERENCES appointment(id)
   )
`);

    db.run(`
      INSERT OR IGNORE INTO appointment (user_id,sender_id,chat_id,created_by,date,time,status,created_at,reason)
      VALUES
      ((SELECT id FROM users WHERE email='john.doe@example.com'),(SELECT id FROM users WHERE email='dr.sarah.johnson@example.com'),(SELECT id FROM chats WHERE created_by=(SELECT id FROM users WHERE email='john.doe@example.com') LIMIT 1),(SELECT id FROM users WHERE email='john.doe@example.com'),'2026-01-01','12:30','scheduled','2025-12-15 09:10:00','Headache consultation – booked during chat with Dr. Sarah Johnson'),
      ((SELECT id FROM users WHERE email='john.doe@example.com'),(SELECT id FROM users WHERE email='dr.sarah.johnson@example.com'),(SELECT id FROM chats WHERE created_by=(SELECT id FROM users WHERE email='john.doe@example.com') LIMIT 1),(SELECT id FROM users WHERE email='john.doe@example.com'),'2025-11-04','14:30','scheduled','2025-10-28 09:30:00','Cold and cough consultation – confirmed in chat with Dr. Sarah Johnson')
    `);


    db.run(`
  CREATE TABLE IF NOT EXISTS user_daily_mood (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        mood TEXT NOT NULL CHECK(mood IN ('Feeling great!', 'Not feeling good!')),
        sleep REAL,
        energy REAL,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY(user_id) REFERENCES users(id),
        UNIQUE(user_id, date)
      )
    `);

    db.run(`
      INSERT OR IGNORE INTO user_daily_mood
      (user_id,date,mood,sleep,energy,created_at) VALUES
      (1,'2025-08-30','Feeling great!',7,8,'2025-08-30T07:00:00Z'),
      (1,'2025-08-31','Not feeling good!',5,4,'2025-08-31T07:00:00Z')
    `);

    // user_symptoms table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_symptoms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  symptom TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('mild','moderate','severe')),
  onset_time TEXT NOT NULL,
  duration TEXT,
  notes TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  recovered_at TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY(user_id) REFERENCES users(id),
  UNIQUE(user_id, symptom, date)
);

    `);

    // Scenario 1: Fever (still ongoing, NOT recovered yet)
db.run(`
  INSERT OR IGNORE INTO user_symptoms
  (user_id,symptom,severity,onset_time,duration,notes,date,time,created_at) VALUES
  (1,'Fever','severe','2025-08-30T06:00:00Z','2 days','High temperature, weakness','2025-08-30','06:00','2025-08-30T06:05:00Z')
`);

// Scenario 2: Cough (already recovered on 1st Aug)
db.run(`
  INSERT OR IGNORE INTO user_symptoms
  (user_id,symptom,severity,onset_time,duration,notes,date,time,recovered_at,created_at) VALUES
  (1,'Cough','moderate','2025-07-31T08:00:00Z','1 day','Dry cough started in morning','2025-07-31','08:00',
   '2025-08-01T09:00:00Z','2025-07-31T08:05:00Z')
`);




    //  Recovery Tasks
    db.run(`
      CREATE TABLE IF NOT EXISTS user_daily_plan (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        symptom TEXT NOT NULL,
        severity TEXT NOT NULL CHECK(severity IN ('mild','moderate','severe')),
        category TEXT NOT NULL,
        task TEXT NOT NULL,
        done INTEGER DEFAULT 0,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY(user_id) REFERENCES users(id),
         UNIQUE(user_id, symptom, category, task, date)
      )
    `);

// Fever tasks
    db.run(`
      INSERT OR IGNORE INTO user_daily_plan
      (user_id,symptom,severity,category,task,done,date,created_at) VALUES
      (1,'Fever','severe','precautions','Immediate medical attention required',0,'2025-08-31','2025-08-31T09:00:00Z'),
      (1,'Fever','severe','food','Only as prescribed by doctor',0,'2025-08-31','2025-08-31T09:01:00Z')
    `);

    // Cough tasks
    db.run(`
      INSERT OR IGNORE INTO user_daily_plan
      (user_id,symptom,severity,category,task,done,date,created_at) VALUES
      (1,'Cough','moderate','precautions','Avoid cold drinks and rest voice',0,'2025-08-31','2025-08-31T09:10:00Z'),
      (1,'Cough','moderate','food','Warm fluids like honey water or soup',0,'2025-08-31','2025-08-31T09:11:00Z'),
      (1,'Cough','moderate','medicines','Cough syrup as prescribed by doctor',0,'2025-08-31','2025-08-31T09:12:00Z'),
      (1,'Cough','moderate','exercises','Breathing exercises if no fever',0,'2025-08-31','2025-08-31T09:13:00Z'),
      (1,'Cough','moderate','avoid','Avoid smoking or alcohol',0,'2025-08-31','2025-08-31T09:14:00Z')
    `);


    db.run(`
      CREATE TABLE IF NOT EXISTS user_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL, -- YYYY-MM-DD (daily snapshot)
        steps INTEGER NOT NULL,
        distance REAL DEFAULT 0, -- meters or km
        speed REAL DEFAULT 0,    -- km/h
        calories REAL DEFAULT 0,
        duration INTEGER DEFAULT 0, -- in seconds
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY(user_id) REFERENCES users(id),
        UNIQUE(user_id, date) -- enforce one row per user per day
      )
    `);
    console.log('Tables created or already exist.');
  });
}

module.exports = initSchema;
