/**
 * initSchema.test.js
 *
 * What This Test File Covers:
 *
 * 1. Schema Creation
 *    - Ensures key tables exist after initSchema runs.
 *
 * 2. Insertion Happy Path
 *    - Inserts a minimal valid row in a core table.
 *
 * 3. Constraint/Default Behavior
 *    - Verifies a representative constraint or default value.
 */

/**
 * initSchema.test.js
 *
 * What This Test File Covers:
 *
 * 1. Users table exists after migration.
 * 2. Inserting valid data succeeds.
 * 3. Invalid data fails (e.g. wrong role/gender).
 */

jest.mock('../../src/config/db');
const db = require('../../src/config/db');
const initSchema = require('../../src/migrations/initSchema');

beforeAll((done) => {
  db.serialize(() => {
    initSchema(); // runs migration on in-memory DB
    done();
  });
});
afterAll(async () => {
  await db.closeConnection();
});

test('users table exists', (done) => {
  db.all(`PRAGMA table_info(users)`, (err, rows) => {
    expect(err).toBeNull();
    expect(rows.length).toBeGreaterThan(0);
    done();
  });
});

test('can insert valid user', (done) => {
  db.run(
    `INSERT INTO users (phone_number, first_name, role) VALUES (?, ?, ?)`,
    ['1234567890', 'John', 'user'],
    function (err) {
      expect(err).toBeNull();
      expect(this.lastID).toBeGreaterThan(0);
      done();
    }
  );
});

test('rejects invalid gender', (done) => {
  db.run(
    `INSERT INTO users (phone_number, first_name, role, gender) VALUES (?, ?, ?, ?)`,
    ['999', 'Bad', 'user', 'not-valid'],
    (err) => {
      expect(err).not.toBeNull();
      done();
    }
  );
});
