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
        (1, '2025-08-15', 'Feeling great!', 2, 1, '2025-08-15T06:58:48Z'),
        (2, '2025-08-15', 'Not feeling good!', 5, 4, '2025-08-15T07:19:22Z'),
        (3, '2025-08-15', 'Not feeling good!', 16, 9, '2025-08-15T06:23:44Z'),
        (1, '2025-08-16', 'Feeling great!', 12, 8, '2025-08-16T07:18:07Z'),
        (2, '2025-08-16', 'Feeling great!', 10, 8, '2025-08-16T07:24:24Z'),
        (3, '2025-08-16', 'Not feeling good!', 19, 8, '2025-08-16T06:55:11Z'),
        (1, '2025-08-17', 'Not feeling good!', 20, 5, '2025-08-17T07:37:14Z'),
        (2, '2025-08-17', 'Not feeling good!', 11, 4, '2025-08-17T07:22:55Z'),
        (3, '2025-08-17', 'Feeling great!', 10, 8, '2025-08-17T06:57:29Z'),
        (1, '2025-08-18', 'Not feeling good!', 20, 4, '2025-08-18T07:38:54Z'),
        (2, '2025-08-18', 'Feeling great!', 9, 1, '2025-08-18T06:14:27Z'),
        (3, '2025-08-18', 'Feeling great!', 16, 7, '2025-08-18T07:38:55Z'),
        (1, '2025-08-19', 'Not feeling good!', 12, 2, '2025-08-19T07:10:12Z'),
        (2, '2025-08-19', 'Feeling great!', 10, 1, '2025-08-19T06:43:20Z'),
        (3, '2025-08-19', 'Not feeling good!', 22, 3, '2025-08-19T06:22:11Z'),
        (1, '2025-08-20', 'Feeling great!', 10, 7, '2025-08-20T06:10:40Z'),
        (2, '2025-08-20', 'Not feeling good!', 7, 5, '2025-08-20T07:29:34Z'),
        (3, '2025-08-20', 'Feeling great!', 18, 6, '2025-08-20T06:44:19Z'),
        (1, '2025-08-21', 'Not feeling good!', 5, 9, '2025-08-21T06:33:51Z'),
        (2, '2025-08-21', 'Feeling great!', 21, 4, '2025-08-21T06:05:12Z'),
        (3, '2025-08-21', 'Not feeling good!', 6, 2, '2025-08-21T07:42:00Z'),
        (1, '2025-08-22', 'Feeling great!', 23, 6, '2025-08-22T06:20:25Z'),
        (2, '2025-08-22', 'Not feeling good!', 12, 2, '2025-08-22T07:47:39Z'),
        (3, '2025-08-22', 'Feeling great!', 3, 7, '2025-08-22T06:17:58Z'),
        (1, '2025-08-23', 'Feeling great!', 7, 3, '2025-08-23T07:40:44Z'),
        (2, '2025-08-23', 'Feeling great!', 19, 8, '2025-08-23T06:58:06Z'),
        (3, '2025-08-23', 'Not feeling good!', 14, 5, '2025-08-23T06:05:31Z'),
        (1, '2025-08-24', 'Not feeling good!', 14, 2, '2025-08-24T06:49:33Z'),
        (2, '2025-08-24', 'Feeling great!', 2, 9, '2025-08-24T06:36:57Z'),
        (3, '2025-08-24', 'Feeling great!', 11, 8, '2025-08-24T07:53:21Z'),
        (1, '2025-08-25', 'Feeling great!', 9, 10, '2025-08-25T06:31:05Z'),
        (2, '2025-08-25', 'Not feeling good!', 17, 3, '2025-08-25T07:05:44Z'),
        (3, '2025-08-25', 'Not feeling good!', 5, 4, '2025-08-25T06:28:19Z'),
        (1, '2025-08-26', 'Feeling great!', 13, 9, '2025-08-26T06:55:23Z'),
        (2, '2025-08-26', 'Not feeling good!', 11, 5, '2025-08-26T06:55:00Z'),
        (3, '2025-08-26', 'Not feeling good!', 22, 3, '2025-08-26T06:36:36Z'),
        (1, '2025-08-27', 'Not feeling good!', 20, 10, '2025-08-27T06:17:44Z'),
        (2, '2025-08-27', 'Feeling great!', 22, 6, '2025-08-27T07:44:44Z'),
        (3, '2025-08-27', 'Feeling great!', 5, 9, '2025-08-27T06:15:53Z'),
        (1, '2025-08-28', 'Feeling great!', 18, 3, '2025-08-28T06:25:39Z'),
        (2, '2025-08-28', 'Not feeling good!', 14, 2, '2025-08-28T06:22:32Z'),
        (3, '2025-08-28', 'Feeling great!', 12, 5, '2025-08-28T06:43:41Z'),
        (1, '2025-08-29', 'Feeling great!', 8, 1, '2025-08-29T06:05:24Z'),
        (2, '2025-08-29', 'Not feeling good!', 16, 3, '2025-08-29T07:34:30Z'),
        (3, '2025-08-29', 'Feeling great!', 18, 5, '2025-08-29T07:33:57Z'),
        (1, '2025-08-30', 'Not feeling good!', 7, 9, '2025-08-30T07:25:17Z'),
        (2, '2025-08-30', 'Feeling great!', 12, 8, '2025-08-30T07:55:03Z'),
        (3, '2025-08-30', 'Not feeling good!', 7, 1, '2025-08-30T06:11:54Z'),
        (1, '2025-09-01', 'Feeling great!', 17, 5, '2025-09-01T07:17:16Z'),
        (2, '2025-09-01', 'Feeling great!', 22, 8, '2025-09-01T06:21:51Z'),
        (3, '2025-09-01', 'Not feeling good!', 23, 8, '2025-09-01T07:05:00Z'),
        (1, '2025-09-02', 'Not feeling good!', 10, 5, '2025-09-02T06:00:51Z'),
        (2, '2025-09-02', 'Not feeling good!', 10, 2, '2025-09-02T06:45:47Z'),
        (3, '2025-09-02', 'Feeling great!', 17, 7, '2025-09-02T07:43:12Z'),
        (1, '2025-09-03', 'Feeling great!', 16, 10, '2025-09-03T06:21:35Z'),
        (2, '2025-09-03', 'Feeling great!', 24, 6, '2025-09-03T06:48:21Z'),
        (3, '2025-09-03', 'Feeling great!', 6, 8, '2025-09-03T07:03:21Z'),
        (1, '2025-09-04', 'Not feeling good!', 11, 6, '2025-09-04T06:29:00Z'),
        (2, '2025-09-04', 'Not feeling good!', 12, 8, '2025-09-04T06:30:19Z'),
        (3, '2025-09-04', 'Feeling great!', 8, 6, '2025-09-04T06:51:42Z'),
        (1, '2025-09-05', 'Not feeling good!', 24, 4, '2025-09-05T06:46:46Z'),
        (2, '2025-09-05', 'Feeling great!', 9, 6, '2025-09-05T07:06:08Z'),
        (3, '2025-09-05', 'Feeling great!', 23, 1, '2025-09-05T07:06:58Z'),
        (1, '2025-09-06', 'Feeling great!', 20, 8, '2025-09-06T07:38:10Z'),
        (2, '2025-09-06', 'Feeling great!', 11, 3, '2025-09-06T06:20:15Z'),
        (3, '2025-09-06', 'Not feeling good!', 9, 8, '2025-09-06T07:50:17Z'),
        (1, '2025-09-07', 'Feeling great!', 22, 3, '2025-09-07T07:09:35Z'),
        (2, '2025-09-07', 'Feeling great!', 20, 9, '2025-09-07T06:30:14Z'),
        (3, '2025-09-07', 'Feeling great!', 17, 7, '2025-09-07T07:28:14Z'),
        (1, '2025-09-08', 'Feeling great!', 23, 8, '2025-09-08T07:09:59Z'),
        (2, '2025-09-08', 'Not feeling good!', 14, 7, '2025-09-08T06:08:58Z'),
        (3, '2025-09-08', 'Not feeling good!', 15, 1, '2025-09-08T07:28:24Z'),
        (1, '2025-09-09', 'Not feeling good!', 4, 1, '2025-09-09T06:59:09Z'),
        (2, '2025-09-09', 'Feeling great!', 10, 1, '2025-09-09T06:58:44Z'),
        (3, '2025-09-09', 'Not feeling good!', 20, 8, '2025-09-09T07:39:01Z'),
        (1, '2025-09-10', 'Feeling great!', 6, 8, '2025-09-10T07:38:54Z'),
        (2, '2025-09-10', 'Not feeling good!', 18, 7, '2025-09-10T07:59:35Z'),
        (3, '2025-09-10', 'Feeling great!', 2, 6, '2025-09-10T06:11:26Z'),
        (1, '2025-09-11', 'Not feeling good!', 20, 6, '2025-09-11T07:30:45Z'),
        (2, '2025-09-11', 'Not feeling good!', 14, 6, '2025-09-11T07:53:50Z'),
        (3, '2025-09-11', 'Not feeling good!', 8, 10, '2025-09-11T06:37:34Z'),
        (1, '2025-09-12', 'Not feeling good!', 9, 1, '2025-09-12T07:50:31Z'),
        (2, '2025-09-12', 'Feeling great!', 5, 5, '2025-09-12T07:00:45Z'),
        (3, '2025-09-12', 'Not feeling good!', 2, 6, '2025-09-12T06:30:32Z'),
        (1, '2025-09-13', 'Not feeling good!', 10, 4, '2025-09-13T06:45:51Z'),
        (2, '2025-09-13', 'Feeling great!', 5, 10, '2025-09-13T06:22:09Z'),
        (3, '2025-09-13', 'Not feeling good!', 4, 4, '2025-09-13T06:44:29Z'),
        (1, '2025-09-14', 'Feeling great!', 1, 4, '2025-09-14T07:17:37Z'),
        (2, '2025-09-14', 'Feeling great!', 6, 1, '2025-09-14T06:17:52Z'),
        (3, '2025-09-14', 'Feeling great!', 19, 8, '2025-09-14T07:39:36Z'),
        (1, '2025-09-15', 'Feeling great!', 21, 8, '2025-09-15T06:36:45Z'),
        (2, '2025-09-15', 'Feeling great!', 6, 2, '2025-09-15T07:07:41Z'),
        (3, '2025-09-15', 'Feeling great!', 8, 3, '2025-09-15T06:24:53Z'),
        (1, '2025-09-16', 'Not feeling good!', 2, 10, '2025-09-16T06:53:17Z'),
        (2, '2025-09-16', 'Feeling great!', 16, 10, '2025-09-16T07:54:19Z'),
        (3, '2025-09-16', 'Not feeling good!', 12, 5, '2025-09-16T06:08:57Z'),
        (1, '2025-09-17', 'Not feeling good!', 12, 10, '2025-09-17T06:49:40Z'),
        (2, '2025-09-17', 'Not feeling good!', 5, 6, '2025-09-17T06:29:11Z'),
        (3, '2025-09-17', 'Feeling great!', 10, 6, '2025-09-17T07:57:52Z'),
        (1, '2025-09-18', 'Not feeling good!', 16, 2, '2025-09-18T06:48:23Z'),
        (2, '2025-09-18', 'Not feeling good!', 12, 2, '2025-09-18T06:35:45Z'),
        (3, '2025-09-18', 'Feeling great!', 4, 5, '2025-09-18T06:15:31Z'),
        (1, '2025-09-19', 'Feeling great!', 21, 6, '2025-09-19T06:16:47Z'),
        (2, '2025-09-19', 'Not feeling good!', 14, 4, '2025-09-19T07:41:39Z'),
        (3, '2025-09-19', 'Feeling great!', 21, 9, '2025-09-19T06:05:14Z'),
        (1, '2025-09-20', 'Feeling great!', 10, 6, '2025-09-20T07:55:21Z'),
        (2, '2025-09-20', 'Feeling great!', 16, 1, '2025-09-20T06:20:00Z'),
        (3, '2025-09-20', 'Feeling great!', 2, 7, '2025-09-20T06:17:36Z'),
        (1, '2025-09-21', 'Not feeling good!', 21, 3, '2025-09-21T07:19:32Z'),
        (2, '2025-09-21', 'Not feeling good!', 4, 3, '2025-09-21T06:31:40Z'),
        (3, '2025-09-21', 'Feeling great!', 1, 10, '2025-09-21T06:48:14Z'),
        (1, '2025-09-22', 'Feeling great!', 14, 8, '2025-09-22T06:30:45Z'),
        (2, '2025-09-22', 'Not feeling good!', 24, 10, '2025-09-22T06:38:05Z'),
        (3, '2025-09-22', 'Not feeling good!', 14, 7, '2025-09-22T06:27:44Z'),
        (1, '2025-09-23', 'Not feeling good!', 15, 1, '2025-09-23T06:38:52Z'),
        (2, '2025-09-23', 'Feeling great!', 24, 3, '2025-09-23T07:26:51Z'),
        (3, '2025-09-23', 'Not feeling good!', 2, 9, '2025-09-23T07:06:37Z'),
        (1, '2025-09-24', 'Not feeling good!', 23, 1, '2025-09-24T06:43:26Z'),
        (2, '2025-09-24', 'Feeling great!', 9, 5, '2025-09-24T06:52:44Z'),
        (3, '2025-09-24', 'Feeling great!', 10, 7, '2025-09-24T07:58:18Z'),
        (1, '2025-09-25', 'Not feeling good!', 9, 4, '2025-09-25T07:16:58Z'),
        (2, '2025-09-25', 'Not feeling good!', 22, 1, '2025-09-25T06:17:40Z'),
        (3, '2025-09-25', 'Feeling great!', 2, 1, '2025-09-25T06:05:31Z'),
        (1, '2025-09-26', 'Not feeling good!', 6, 9, '2025-09-26T06:00:45Z'),
        (2, '2025-09-26', 'Feeling great!', 24, 5, '2025-09-26T07:39:21Z'),
        (3, '2025-09-26', 'Feeling great!', 13, 5, '2025-09-26T06:51:17Z'),
        (1, '2025-09-27', 'Not feeling good!', 13, 5, '2025-09-27T06:36:13Z'),
        (2, '2025-09-27', 'Feeling great!', 13, 4, '2025-09-27T07:33:41Z'),
        (3, '2025-09-27', 'Feeling great!', 22, 9, '2025-09-27T07:33:39Z'),
        (1, '2025-09-28', 'Feeling great!', 9, 7, '2025-09-28T07:45:56Z'),
        (2, '2025-09-28', 'Feeling great!', 6, 8, '2025-09-28T07:30:31Z'),
        (3, '2025-09-28', 'Not feeling good!', 9, 8, '2025-09-28T07:53:49Z'),
        (1, '2025-09-29', 'Not feeling good!', 6, 5, '2025-09-29T07:35:04Z'),
        (2, '2025-09-29', 'Not feeling good!', 8, 8, '2025-09-29T06:41:48Z'),
        (3, '2025-09-29', 'Feeling great!', 2, 6, '2025-09-29T06:58:19Z'),
        (1, '2025-09-30', 'Not feeling good!', 11, 3, '2025-09-30T06:31:49Z'),
        (2, '2025-09-30', 'Feeling great!', 2, 4, '2025-09-30T07:36:17Z'),
        (3, '2025-09-30', 'Not feeling good!', 14, 5, '2025-09-30T06:42:18Z'),
        (1, '2025-10-01', 'Feeling great!', 12, 6, '2025-10-01T06:44:43Z'),
        (2, '2025-10-01', 'Feeling great!', 20, 7, '2025-10-01T07:07:02Z'),
        (3, '2025-10-01', 'Feeling great!', 21, 8, '2025-10-01T06:38:30Z'),
        (1, '2025-10-02', 'Feeling great!', 2, 4, '2025-10-02T06:06:47Z'),
        (2, '2025-10-02', 'Feeling great!', 3, 3, '2025-10-02T06:35:20Z'),
        (3, '2025-10-02', 'Not feeling good!', 4, 9, '2025-10-02T06:59:29Z'),
        (1, '2025-10-03', 'Feeling great!', 1, 1, '2025-10-03T07:17:33Z'),
        (2, '2025-10-03', 'Feeling great!', 3, 5, '2025-10-03T06:06:10Z'),
        (3, '2025-10-03', 'Not feeling good!', 4, 3, '2025-10-03T07:15:43Z'),
        (1, '2025-10-04', 'Feeling great!', 9, 4, '2025-10-04T07:29:05Z'),
        (2, '2025-10-04', 'Feeling great!', 10, 5, '2025-10-04T06:42:00Z'),
        (3, '2025-10-04', 'Feeling great!', 24, 6, '2025-10-04T06:33:20Z'),
        (1, '2025-10-05', 'Feeling great!', 14, 4, '2025-10-05T06:37:56Z'),
        (2, '2025-10-05', 'Feeling great!', 14, 9, '2025-10-05T06:43:43Z'),
        (3, '2025-10-05', 'Not feeling good!', 22, 4, '2025-10-05T07:29:58Z'),
        (1, '2025-10-06', 'Feeling great!', 22, 3, '2025-10-06T06:45:11Z'),
        (2, '2025-10-06', 'Feeling great!', 7, 6, '2025-10-06T07:40:26Z'),
        (3, '2025-10-06', 'Feeling great!', 23, 2, '2025-10-06T07:43:10Z'),
        (1, '2025-10-07', 'Not feeling good!', 15, 8, '2025-10-07T06:18:26Z'),
        (2, '2025-10-07', 'Feeling great!', 19, 10, '2025-10-07T06:59:41Z'),
        (3, '2025-10-07', 'Feeling great!', 2, 3, '2025-10-07T06:34:06Z'),
        (1, '2025-10-08', 'Feeling great!', 9, 4, '2025-10-08T06:46:23Z'),
        (2, '2025-10-08', 'Feeling great!', 14, 6, '2025-10-08T07:43:24Z'),
        (3, '2025-10-08', 'Not feeling good!', 3, 7, '2025-10-08T06:53:35Z'),
        (1, '2025-10-09', 'Feeling great!', 12, 7, '2025-10-09T07:32:52Z'),
        (2, '2025-10-09', 'Feeling great!', 4, 9, '2025-10-09T06:41:15Z'),
        (3, '2025-10-09', 'Feeling great!', 9, 1, '2025-10-09T06:23:42Z'),
        (1, '2025-10-10', 'Feeling great!', 23, 9, '2025-10-10T07:17:34Z'),
        (2, '2025-10-10', 'Feeling great!', 5, 8, '2025-10-10T06:28:50Z'),
        (3, '2025-10-10', 'Feeling great!', 3, 1, '2025-10-10T07:51:36Z'),
        (1, '2025-10-11', 'Not feeling good!', 9, 10, '2025-10-11T07:35:47Z'),
        (2, '2025-10-11', 'Not feeling good!', 9, 9, '2025-10-11T06:51:39Z'),
        (3, '2025-10-11', 'Feeling great!', 22, 6, '2025-10-11T06:08:20Z'),
        (1, '2025-10-12', 'Feeling great!', 1, 6, '2025-10-12T07:00:20Z'),
        (2, '2025-10-12', 'Not feeling good!', 6, 2, '2025-10-12T06:56:45Z'),
        (3, '2025-10-12', 'Feeling great!', 1, 4, '2025-10-12T07:47:35Z'),
        (1, '2025-10-13', 'Not feeling good!', 12, 9, '2025-10-13T06:20:53Z'),
        (2, '2025-10-13', 'Feeling great!', 15, 7, '2025-10-13T07:55:21Z'),
        (3, '2025-10-13', 'Feeling great!', 21, 10, '2025-10-13T06:34:45Z'),
        (1, '2025-10-14', 'Not feeling good!', 14, 9, '2025-10-14T06:34:50Z'),
        (2, '2025-10-14', 'Not feeling good!', 18, 5, '2025-10-14T07:27:10Z'),
        (3, '2025-10-14', 'Not feeling good!', 16, 9, '2025-10-14T07:48:27Z'),
        (1, '2025-10-15', 'Feeling great!', 1, 8, '2025-10-15T06:54:57Z'),
        (2, '2025-10-15', 'Feeling great!', 24, 1, '2025-10-15T07:11:44Z'),
        (3, '2025-10-15', 'Feeling great!', 13, 7, '2025-10-15T06:12:18Z'),
        (1, '2025-10-16', 'Not feeling good!', 8, 8, '2025-10-16T07:14:36Z'),
        (2, '2025-10-16', 'Not feeling good!', 21, 7, '2025-10-16T06:07:35Z'),
        (3, '2025-10-16', 'Feeling great!', 22, 4, '2025-10-16T06:50:27Z'),
        (1, '2025-10-17', 'Not feeling good!', 22, 8, '2025-10-17T07:17:39Z'),
        (2, '2025-10-17', 'Not feeling good!', 1, 7, '2025-10-17T06:42:22Z'),
        (3, '2025-10-17', 'Feeling great!', 16, 9, '2025-10-17T07:14:04Z'),
        (1, '2025-10-18', 'Feeling great!', 10, 8, '2025-10-18T07:11:25Z'),
        (2, '2025-10-18', 'Feeling great!', 17, 6, '2025-10-18T07:01:34Z'),
        (3, '2025-10-18', 'Feeling great!', 14, 3, '2025-10-18T06:02:50Z'),
        (1, '2025-10-19', 'Feeling great!', 2, 4, '2025-10-19T06:31:10Z'),
        (2, '2025-10-19', 'Not feeling good!', 21, 4, '2025-10-19T07:56:24Z'),
        (3, '2025-10-19', 'Feeling great!', 17, 10, '2025-10-19T06:47:45Z'),
        (1, '2025-10-20', 'Not feeling good!', 7, 5, '2025-10-20T06:40:31Z'),
        (2, '2025-10-20', 'Feeling great!', 1, 8, '2025-10-20T07:23:47Z'),
        (3, '2025-10-20', 'Feeling great!', 11, 10, '2025-10-20T07:10:43Z'),
        (1, '2025-10-21', 'Not feeling good!', 5, 3, '2025-10-21T06:58:22Z'),
        (2, '2025-10-21', 'Feeling great!', 2, 1, '2025-10-21T07:24:04Z'),
        (3, '2025-10-21', 'Feeling great!', 3, 1, '2025-10-21T06:17:21Z'),
        (1, '2025-10-22', 'Not feeling good!', 11, 2, '2025-10-22T06:20:51Z'),
        (2, '2025-10-22', 'Not feeling good!', 22, 4, '2025-10-22T07:51:30Z'),
        (3, '2025-10-22', 'Feeling great!', 3, 7, '2025-10-22T06:50:21Z'),
        (1, '2025-10-23', 'Feeling great!', 23, 3, '2025-10-23T06:12:22Z'),
        (2, '2025-10-23', 'Feeling great!', 19, 7, '2025-10-23T06:58:32Z'),
        (3, '2025-10-23', 'Feeling great!', 8, 2, '2025-10-23T06:28:04Z'),
        (1, '2025-10-24', 'Not feeling good!', 23, 8, '2025-10-24T06:15:43Z'),
        (2, '2025-10-24', 'Not feeling good!', 3, 2, '2025-10-24T06:31:51Z'),
        (3, '2025-10-24', 'Feeling great!', 10, 2, '2025-10-24T07:23:45Z'),
        (1, '2025-10-25', 'Not feeling good!', 22, 8, '2025-10-25T06:36:03Z'),
        (2, '2025-10-25', 'Feeling great!', 4, 1, '2025-10-25T07:12:49Z'),
        (3, '2025-10-25', 'Feeling great!', 23, 5, '2025-10-25T06:16:12Z'),
        (1, '2025-10-26', 'Not feeling good!', 7, 8, '2025-10-26T07:20:53Z'),
        (2, '2025-10-26', 'Not feeling good!', 6, 7, '2025-10-26T07:28:07Z'),
        (3, '2025-10-26', 'Not feeling good!', 18, 5, '2025-10-26T06:14:44Z'),
        (1, '2025-10-27', 'Not feeling good!', 13, 4, '2025-10-27T06:07:25Z'),
        (2, '2025-10-27', 'Feeling great!', 13, 9, '2025-10-27T07:14:50Z'),
        (3, '2025-10-27', 'Feeling great!', 13, 5, '2025-10-27T07:59:46Z'),
        (1, '2025-10-28', 'Not feeling good!', 16, 9, '2025-10-28T06:44:07Z'),
        (2, '2025-10-28', 'Not feeling good!', 10, 1, '2025-10-28T06:48:10Z'),
        (3, '2025-10-28', 'Not feeling good!', 16, 10, '2025-10-28T07:47:55Z'),
        (1, '2025-10-29', 'Not feeling good!', 9, 3, '2025-10-29T07:50:10Z'),
        (2, '2025-10-29', 'Feeling great!', 8, 9, '2025-10-29T07:51:42Z'),
        (3, '2025-10-29', 'Not feeling good!', 12, 1, '2025-10-29T07:35:54Z'),
        (1, '2025-10-30', 'Feeling great!', 17, 9, '2025-10-30T06:15:50Z'),
        (2, '2025-10-30', 'Feeling great!', 5, 8, '2025-10-30T06:52:34Z'),
        (3, '2025-10-30', 'Not feeling good!', 22, 5, '2025-10-30T06:06:41Z'),
        (1, '2025-10-31', 'Not feeling good!', 17, 6, '2025-10-31T06:24:55Z'),
        (2, '2025-10-31', 'Feeling great!', 9, 2, '2025-10-31T06:32:24Z'),
        (3, '2025-10-31', 'Not feeling good!', 10, 3, '2025-10-31T06:54:33Z'),
        (1, '2025-11-01', 'Feeling great!', 4, 9, '2025-11-01T06:05:55Z'),
        (2, '2025-11-01', 'Feeling great!', 17, 2, '2025-11-01T06:44:38Z'),
        (3, '2025-11-01', 'Not feeling good!', 16, 3, '2025-11-01T06:58:33Z'),
        (1, '2025-11-02', 'Not feeling good!', 12, 5, '2025-11-02T07:45:31Z'),
        (2, '2025-11-02', 'Not feeling good!', 3, 3, '2025-11-02T06:37:57Z'),
        (3, '2025-11-02', 'Feeling great!', 10, 7, '2025-11-02T07:50:38Z'),
        (1, '2025-11-03', 'Not feeling good!', 19, 2, '2025-11-03T07:16:11Z'),
        (2, '2025-11-03', 'Feeling great!', 10, 8, '2025-11-03T06:58:33Z'),
        (3, '2025-11-03', 'Feeling great!', 24, 4, '2025-11-03T06:11:21Z'),
        (1, '2025-11-04', 'Feeling great!', 2, 1, '2025-11-04T07:41:49Z'),
        (2, '2025-11-04', 'Feeling great!', 8, 4, '2025-11-04T07:29:42Z'),
        (3, '2025-11-04', 'Feeling great!', 16, 6, '2025-11-04T06:46:31Z'),
        (1, '2025-11-05', 'Not feeling good!', 15, 1, '2025-11-05T06:33:44Z'),
        (2, '2025-11-05', 'Feeling great!', 8, 6, '2025-11-05T06:20:30Z'),
        (3, '2025-11-05', 'Not feeling good!', 12, 6, '2025-11-05T06:33:09Z'),
        (1, '2025-11-06', 'Feeling great!', 6, 5, '2025-11-06T06:46:09Z'),
        (2, '2025-11-06', 'Not feeling good!', 4, 5, '2025-11-06T06:04:34Z'),
        (3, '2025-11-06', 'Feeling great!', 3, 8, '2025-11-06T06:50:36Z'),
        (1, '2025-11-07', 'Feeling great!', 2, 9, '2025-11-07T07:03:09Z'),
        (2, '2025-11-07', 'Not feeling good!', 22, 1, '2025-11-07T07:58:17Z'),
        (3, '2025-11-07', 'Feeling great!', 6, 10, '2025-11-07T07:31:45Z'),
        (1, '2025-11-08', 'Not feeling good!', 20, 10, '2025-11-08T06:51:40Z'),
        (2, '2025-11-08', 'Not feeling good!', 10, 3, '2025-11-08T06:37:30Z'),
        (3, '2025-11-08', 'Not feeling good!', 12, 8, '2025-11-08T06:52:23Z'),
        (1, '2025-11-09', 'Feeling great!', 8, 1, '2025-11-09T06:47:27Z'),
        (2, '2025-11-09', 'Feeling great!', 6, 10, '2025-11-09T06:23:20Z'),
        (3, '2025-11-09', 'Not feeling good!', 11, 2, '2025-11-09T07:14:05Z'),
        (1, '2025-11-10', 'Feeling great!', 22, 5, '2025-11-10T06:50:26Z'),
        (2, '2025-11-10', 'Feeling great!', 11, 7, '2025-11-10T06:31:09Z'),
        (3, '2025-11-10', 'Feeling great!', 18, 3, '2025-11-10T06:52:43Z'),
        (1, '2025-11-11', 'Feeling great!', 8, 3, '2025-11-11T06:08:37Z'),
        (2, '2025-11-11', 'Not feeling good!', 19, 10, '2025-11-11T07:48:49Z'),
        (3, '2025-11-11', 'Not feeling good!', 6, 9, '2025-11-11T06:01:52Z'),
        (1, '2025-11-12', 'Not feeling good!', 2, 3, '2025-11-12T07:37:01Z'),
        (2, '2025-11-12', 'Feeling great!', 14, 10, '2025-11-12T06:28:52Z'),
        (3, '2025-11-12', 'Feeling great!', 13, 6, '2025-11-12T07:59:03Z'),
        (1, '2025-11-13', 'Feeling great!', 16, 10, '2025-11-13T06:36:19Z'),
        (2, '2025-11-13', 'Not feeling good!', 11, 9, '2025-11-13T06:59:27Z'),
        (3, '2025-11-13', 'Not feeling good!', 15, 2, '2025-11-13T06:22:37Z'),
        (1, '2025-11-14', 'Feeling great!', 11, 1, '2025-11-14T06:50:30Z'),
        (2, '2025-11-14', 'Not feeling good!', 21, 9, '2025-11-14T06:54:32Z'),
        (3, '2025-11-14', 'Not feeling good!', 9, 5, '2025-11-14T06:29:06Z'),
        (1, '2025-11-15', 'Feeling great!', 3, 6, '2025-11-15T07:09:22Z'),
        (2, '2025-11-15', 'Feeling great!', 13, 2, '2025-11-15T06:55:17Z'),
        (3, '2025-11-15', 'Feeling great!', 24, 8, '2025-11-15T07:04:56Z'),
        (1, '2025-11-16', 'Not feeling good!', 23, 6, '2025-11-16T06:19:26Z'),
        (2, '2025-11-16', 'Feeling great!', 10, 10, '2025-11-16T06:48:15Z'),
        (3, '2025-11-16', 'Not feeling good!', 18, 4, '2025-11-16T06:36:24Z'),
        (1, '2025-11-17', 'Not feeling good!', 10, 9, '2025-11-17T06:13:24Z'),
        (2, '2025-11-17', 'Not feeling good!', 14, 7, '2025-11-17T06:23:50Z'),
        (3, '2025-11-17', 'Feeling great!', 2, 7, '2025-11-17T07:52:21Z'),
        (1, '2025-11-18', 'Feeling great!', 4, 10, '2025-11-18T07:23:28Z'),
        (2, '2025-11-18', 'Not feeling good!', 21, 6, '2025-11-18T06:20:53Z'),
        (3, '2025-11-18', 'Feeling great!', 5, 1, '2025-11-18T07:44:31Z'),
        (1, '2025-11-19', 'Feeling great!', 22, 9, '2025-11-19T06:53:41Z'),
        (2, '2025-11-19', 'Feeling great!', 5, 2, '2025-11-19T06:40:21Z'),
        (3, '2025-11-19', 'Feeling great!', 4, 10, '2025-11-19T07:45:01Z'),
        (1, '2025-11-20', 'Feeling great!', 8, 6, '2025-11-20T07:48:58Z'),
        (2, '2025-11-20', 'Not feeling good!', 1, 9, '2025-11-20T06:54:29Z'),
        (3, '2025-11-20', 'Feeling great!', 24, 7, '2025-11-20T06:58:34Z'),
        (1, '2025-11-21', 'Not feeling good!', 17, 1, '2025-11-21T06:00:55Z'),
        (2, '2025-11-21', 'Not feeling good!', 16, 3, '2025-11-21T07:13:42Z'),
        (3, '2025-11-21', 'Feeling great!', 16, 7, '2025-11-21T06:35:44Z'),
        (1, '2025-11-22', 'Feeling great!', 21, 3, '2025-11-22T07:21:38Z'),
        (2, '2025-11-22', 'Feeling great!', 11, 8, '2025-11-22T07:39:45Z'),
        (3, '2025-11-22', 'Feeling great!', 2, 9, '2025-11-22T06:17:33Z'),
        (1, '2025-11-23', 'Feeling great!', 6, 5, '2025-11-23T06:22:51Z'),
        (2, '2025-11-23', 'Not feeling good!', 7, 6, '2025-11-23T06:52:51Z'),
        (3, '2025-11-23', 'Feeling great!', 10, 7, '2025-11-23T06:57:45Z'),
        (1, '2025-11-24', 'Feeling great!', 3, 4, '2025-11-24T06:09:28Z'),
        (2, '2025-11-24', 'Feeling great!', 1, 9, '2025-11-24T06:10:58Z'),
        (3, '2025-11-24', 'Not feeling good!', 2, 8, '2025-11-24T07:31:58Z'),
        (1, '2025-11-25', 'Not feeling good!', 18, 6, '2025-11-25T06:30:07Z'),
        (2, '2025-11-25', 'Not feeling good!', 11, 9, '2025-11-25T07:47:31Z'),
        (3, '2025-11-25', 'Not feeling good!', 8, 10, '2025-11-25T06:54:05Z'),
        (1, '2025-11-26', 'Not feeling good!', 6, 4, '2025-11-26T06:48:14Z'),
        (2, '2025-11-26', 'Not feeling good!', 6, 4, '2025-11-26T06:32:28Z'),
        (3, '2025-11-26', 'Feeling great!', 2, 7, '2025-11-26T06:08:55Z'),
        (1, '2025-11-27', 'Not feeling good!', 6, 5, '2025-11-27T07:59:35Z'),
        (2, '2025-11-27', 'Feeling great!', 10, 9, '2025-11-27T07:16:51Z'),
        (3, '2025-11-27', 'Feeling great!', 23, 8, '2025-11-27T06:29:28Z'),
        (1, '2025-11-28', 'Not feeling good!', 3, 1, '2025-11-28T06:28:31Z'),
        (2, '2025-11-28', 'Not feeling good!', 1, 2, '2025-11-28T07:24:14Z'),
        (3, '2025-11-28', 'Not feeling good!', 13, 1, '2025-11-28T06:43:06Z'),
        (1, '2025-11-29', 'Feeling great!', 16, 7, '2025-11-29T06:42:18Z'),
        (2, '2025-11-29', 'Feeling great!', 15, 10, '2025-11-29T06:20:45Z'),
        (3, '2025-11-29', 'Not feeling good!', 9, 10, '2025-11-29T06:19:05Z'),
        (1, '2025-11-30', 'Not feeling good!', 23, 5, '2025-11-30T06:27:38Z'),
        (2, '2025-11-30', 'Not feeling good!', 18, 5, '2025-11-30T06:33:12Z'),
        (3, '2025-11-30', 'Not feeling good!', 5, 10, '2025-11-30T07:16:11Z'),
        (1, '2025-12-01', 'Not feeling good!', 11, 3, '2025-12-01T07:19:44Z'),
        (2, '2025-12-01', 'Feeling great!', 16, 9, '2025-12-01T06:32:15Z'),
        (3, '2025-12-01', 'Feeling great!', 8, 6, '2025-12-01T06:54:51Z'),

        (1, '2025-12-02', 'Feeling great!', 18, 10, '2025-12-02T07:43:28Z'),
        (2, '2025-12-02', 'Not feeling good!', 14, 2, '2025-12-02T06:20:19Z'),
        (3, '2025-12-02', 'Not feeling good!', 4, 5, '2025-12-02T07:27:55Z'),

        (1, '2025-12-03', 'Not feeling good!', 7, 6, '2025-12-03T06:14:43Z'),
        (2, '2025-12-03', 'Feeling great!', 9, 7, '2025-12-03T07:38:02Z'),
        (3, '2025-12-03', 'Feeling great!', 21, 10, '2025-12-03T06:56:24Z'),

        (1, '2025-12-04', 'Feeling great!', 22, 9, '2025-12-04T07:16:35Z'),
        (2, '2025-12-04', 'Feeling great!', 4, 6, '2025-12-04T06:29:45Z'),
        (3, '2025-12-04', 'Not feeling good!', 19, 2, '2025-12-04T06:43:55Z'),

        (1, '2025-12-05', 'Not feeling good!', 6, 1, '2025-12-05T07:30:17Z'),
        (2, '2025-12-05', 'Not feeling good!', 10, 3, '2025-12-05T07:07:33Z'),
        (3, '2025-12-05', 'Feeling great!', 13, 8, '2025-12-05T06:23:12Z'),

        (1, '2025-12-06', 'Feeling great!', 12, 4, '2025-12-06T07:59:21Z'),
        (2, '2025-12-06', 'Feeling great!', 21, 8, '2025-12-06T06:38:51Z'),
        (3, '2025-12-06', 'Not feeling good!', 15, 3, '2025-12-06T06:11:24Z'),

        (1, '2025-12-07', 'Not feeling good!', 20, 5, '2025-12-07T06:44:28Z'),
        (2, '2025-12-07', 'Feeling great!', 18, 9, '2025-12-07T07:41:59Z'),
        (3, '2025-12-07', 'Feeling great!', 23, 7, '2025-12-07T06:28:05Z'),

        (1, '2025-12-08', 'Feeling great!', 9, 7, '2025-12-08T07:39:41Z'),
        (2, '2025-12-08', 'Not feeling good!', 8, 2, '2025-12-08T06:52:34Z'),
        (3, '2025-12-08', 'Feeling great!', 22, 6, '2025-12-08T07:49:13Z'),

        (1, '2025-12-09', 'Not feeling good!', 17, 3, '2025-12-09T06:41:55Z'),
        (2, '2025-12-09', 'Feeling great!', 11, 10, '2025-12-09T07:13:48Z'),
        (3, '2025-12-09', 'Not feeling good!', 5, 4, '2025-12-09T06:07:27Z'),

        (1, '2025-12-10', 'Feeling great!', 15, 6, '2025-12-10T06:53:20Z'),
        (2, '2025-12-10', 'Not feeling good!', 22, 2, '2025-12-10T07:21:33Z'),
        (3, '2025-12-10', 'Feeling great!', 7, 8, '2025-12-10T06:44:01Z'),

        (1, '2025-12-11', 'Not feeling good!', 11, 4, '2025-12-11T06:09:29Z'),
        (2, '2025-12-11', 'Feeling great!', 20, 10, '2025-12-11T07:58:21Z'),
        (3, '2025-12-11', 'Not feeling good!', 16, 5, '2025-12-11T06:12:13Z'),

        (1, '2025-12-12', 'Feeling great!', 19, 8, '2025-12-12T07:32:14Z'),
        (2, '2025-12-12', 'Not feeling good!', 3, 2, '2025-12-12T06:19:43Z'),
        (3, '2025-12-12', 'Feeling great!', 14, 6, '2025-12-12T07:11:21Z'),

        (1, '2025-12-13', 'Not feeling good!', 8, 5, '2025-12-13T07:48:50Z'),
        (2, '2025-12-13', 'Feeling great!', 7, 9, '2025-12-13T06:20:18Z'),
        (3, '2025-12-13', 'Not feeling good!', 21, 1, '2025-12-13T06:55:11Z'),

        (1, '2025-12-14', 'Feeling great!', 4, 9, '2025-12-14T06:43:44Z'),
        (2, '2025-12-14', 'Feeling great!', 19, 8, '2025-12-14T07:59:09Z'),
        (3, '2025-12-14', 'Not feeling good!', 11, 3, '2025-12-14T06:15:25Z'),

        (1, '2025-12-15', 'Not feeling good!', 16, 5, '2025-12-15T07:33:55Z'),
        (2, '2025-12-15', 'Not feeling good!', 5, 4, '2025-12-15T06:29:41Z'),
        (3, '2025-12-15', 'Feeling great!', 22, 7, '2025-12-15T07:44:50Z'),

        (1, '2025-12-16', 'Feeling great!', 21, 6, '2025-12-16T06:24:20Z'),
        (2, '2025-12-16', 'Feeling great!', 9, 10, '2025-12-16T07:35:49Z'),
        (3, '2025-12-16', 'Not feeling good!', 17, 4, '2025-12-16T06:48:11Z'),

        (1, '2025-12-17', 'Not feeling good!', 12, 2, '2025-12-17T06:11:34Z'),
        (2, '2025-12-17', 'Not feeling good!', 15, 3, '2025-12-17T07:42:05Z'),
        (3, '2025-12-17', 'Feeling great!', 7, 9, '2025-12-17T06:50:22Z'),

        (1, '2025-12-18', 'Feeling great!', 14, 7, '2025-12-18T07:01:10Z'),
        (2, '2025-12-18', 'Feeling great!', 18, 6, '2025-12-18T07:14:40Z'),
        (3, '2025-12-18', 'Not feeling good!', 2, 1, '2025-12-18T06:25:58Z'),

        (1, '2025-12-19', 'Not feeling good!', 3, 4, '2025-12-19T07:28:42Z'),
        (2, '2025-12-19', 'Feeling great!', 11, 8, '2025-12-19T06:34:11Z'),
        (3, '2025-12-19', 'Feeling great!', 24, 9, '2025-12-19T07:39:50Z'),

        (1, '2025-12-20', 'Feeling great!', 19, 10, '2025-12-20T06:57:15Z'),
        (2, '2025-12-20', 'Not feeling good!', 14, 5, '2025-12-20T07:16:22Z'),
        (3, '2025-12-20', 'Not feeling good!', 6, 3, '2025-12-20T06:59:34Z'),

        (1, '2025-12-21', 'Feeling great!', 7, 6, '2025-12-21T06:19:37Z'),
        (2, '2025-12-21', 'Not feeling good!', 13, 2, '2025-12-21T06:41:15Z'),
        (3, '2025-12-21', 'Feeling great!', 9, 7, '2025-12-21T07:31:42Z'),

        (1, '2025-12-22', 'Not feeling good!', 10, 4, '2025-12-22T06:44:13Z'),
        (2, '2025-12-22', 'Feeling great!', 12, 8, '2025-12-22T07:49:29Z'),
        (3, '2025-12-22', 'Not feeling good!', 16, 3, '2025-12-22T07:03:47Z'),

        (1, '2025-12-23', 'Feeling great!', 5, 8, '2025-12-23T07:35:01Z'),
        (2, '2025-12-23', 'Feeling great!', 24, 9, '2025-12-23T06:13:44Z'),
        (3, '2025-12-23', 'Not feeling good!', 20, 2, '2025-12-23T06:54:52Z'),

        (1, '2025-12-24', 'Not feeling good!', 21, 5, '2025-12-24T07:21:48Z'),
        (2, '2025-12-24', 'Not feeling good!', 15, 2, '2025-12-24T06:19:09Z'),
        (3, '2025-12-24', 'Feeling great!', 3, 6, '2025-12-24T07:13:50Z'),

        (1, '2025-12-25', 'Feeling great!', 8, 10, '2025-12-25T06:37:29Z'),
        (2, '2025-12-25', 'Feeling great!', 19, 7, '2025-12-25T07:44:12Z'),
        (3, '2025-12-25', 'Not feeling good!', 4, 1, '2025-12-25T06:05:25Z'),

        (1, '2025-12-26', 'Not feeling good!', 16, 2, '2025-12-26T07:19:59Z'),
        (2, '2025-12-26', 'Feeling great!', 22, 8, '2025-12-26T07:07:10Z'),
        (3, '2025-12-26', 'Not feeling good!', 10, 4, '2025-12-26T06:20:31Z'),

        (1, '2025-12-27', 'Feeling great!', 20, 9, '2025-12-27T07:26:44Z'),
        (2, '2025-12-27', 'Not feeling good!', 2, 3, '2025-12-27T06:15:35Z'),
        (3, '2025-12-27', 'Feeling great!', 17, 10, '2025-12-27T07:39:51Z'),

        (1, '2025-12-28', 'Not feeling good!', 14, 4, '2025-12-28T06:58:28Z'),
        (2, '2025-12-28', 'Not feeling good!', 18, 2, '2025-12-28T06:39:19Z'),
        (3, '2025-12-28', 'Feeling great!', 12, 6, '2025-12-28T07:09:10Z'),

        (1, '2025-12-29', 'Feeling great!', 11, 7, '2025-12-29T06:40:22Z'),
        (2, '2025-12-29', 'Not feeling good!', 20, 5, '2025-12-29T07:52:35Z'),
        (3, '2025-12-29', 'Feeling great!', 15, 8, '2025-12-29T06:33:44Z'),

        (1, '2025-12-30', 'Not feeling good!', 23, 2, '2025-12-30T07:20:40Z'),
        (2, '2025-12-30', 'Feeling great!', 9, 9, '2025-12-30T06:44:01Z'),
        (3, '2025-12-30', 'Not feeling good!', 13, 4, '2025-12-30T07:49:58Z')
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
  (1,'Cough','moderate','2025-07-31T08:00:00Z','1 day','Dry cough started in morning','2025-07-31','08:00', '2025-08-01T09:00:00Z','2025-07-31T08:05:00Z'),
  (1, 'Eye Irritation', 'mild', '2025-08-15T14:30:00Z', '2 hours', 'Eyes felt itchy after screen use', '2025-08-15', '14:30', '2025-08-18T16:30:00Z', '2025-08-15T14:35:00Z'),
  (1, 'Headache', 'severe', '2025-08-20T10:00:00Z', '4 hours', 'Pounding headache after poor sleep', '2025-08-20', '10:00', '2025-08-25T14:00:00Z', '2025-08-20T10:10:00Z'),
  (2, 'Headache', 'moderate', '2025-08-10T09:00:00Z', '3 hours', 'Dull ache after skipping breakfast', '2025-08-10', '09:00', '2025-08-12T12:00:00Z', '2025-08-10T09:05:00Z'),
  (2, 'Fatigue', 'severe', '2025-08-12T16:00:00Z', '6 hours', 'Extreme tiredness after work', '2025-08-12', '16:00', '2025-08-14T22:00:00Z', '2025-08-12T16:05:00Z'),
  (2, 'Sore Throat', 'mild', '2025-08-14T07:30:00Z', '1 day', 'Scratchy throat in morning', '2025-08-14', '07:30', '2025-08-16T08:00:00Z', '2025-08-14T07:35:00Z'),
  (3, 'Joint Pain', 'moderate', '2025-08-09T08:45:00Z', '5 hours', 'Knee and wrist stiffness after walk', '2025-08-09', '08:45', '2025-08-11T13:45:00Z', '2025-08-09T08:50:00Z'),
  (3, 'Runny Nose', 'mild', '2025-08-11T10:00:00Z', '4 hours', 'Allergy symptoms after dust exposure', '2025-08-11', '10:00', '2025-08-13T14:00:00Z', '2025-08-11T10:05:00Z'),
  (3, 'Skin Dryness', 'moderate', '2025-08-13T15:00:00Z', '2 days', 'Dry skin noticed after shower', '2025-08-13', '15:00', '2025-08-16T15:00:00Z', '2025-08-13T15:05:00Z')
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
