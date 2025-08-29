/**
 * auth.test.js
 *
 * What This Test File Covers:
 *
 * 1. Missing Field Handling
 *    - Returns 400 when phone_number is not provided.
 *
 * 2. User Not Found
 *    - Returns 401 when no matching user exists for phone + country_code.
 *
 * 3. Successful Login (Explicit Country Code)
 *    - Returns 200 with a signed JWT for an existing user when country_code is provided.
 *
 * 4. Successful Login (Default Country Code)
 *    - Returns 200 with a signed JWT when country_code is omitted and defaults to '+91'.
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Use an in-memory DB compatible with initSchema; expose closeConnection for teardown
jest.mock('../../src/config/db', () => {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(':memory:');
  db.closeConnection = () => new Promise((resolve) => db.close(resolve));
  return db;
});

const db = require('../../src/config/db');
const initSchema = require('../../src/migrations/initSchema');

// Ensure SECRET used by the route is deterministic for verification
process.env.JWT_SECRET = 'supersecret';

let app;
let authRoutes;
let userId;

beforeAll((done) => {
  db.serialize(() => {
    initSchema(); // run production schema on in-memory DB

    // Seed a user that will be "found" by login
    db.run(
      `INSERT INTO users (phone_number, country_code, first_name, role, is_phone_verified, is_approved)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['9990011223', '+91', 'Alice', 'user', 1, 1],
      function (err) {
        if (err) return done(err);
        userId = this.lastID;

        authRoutes = require('../../src/routes/auth');
        app = express();
        app.use(express.json());
        app.use('/auth', authRoutes(db));
        done();
      }
    );
  });
});

afterAll(async () => {
  await db.closeConnection();
});

beforeEach((done) => {
  // Keep seeded user; ensure no side effects are needed to reset for these tests
  done();
});

test('POST /auth/login without phone_number returns 400', async () => {
  const res = await request(app).post('/auth/login').send({ country_code: '+91' });
  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe('Phone required');
});

test('POST /auth/login returns 401 when user not found', async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ phone_number: '0000000000', country_code: '+91' });
  expect(res.status).toBe(401);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe('User not found');
});

test('POST /auth/login returns 200 and valid JWT when user exists (explicit country_code)', async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ phone_number: '9990011223', country_code: '+91' });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(typeof res.body.token).toBe('string');

  const decoded = jwt.verify(res.body.token, 'supersecret');
  expect(decoded.id).toBe(userId);
  expect(decoded.role).toBe('user');
  expect(decoded.is_phone_verified).toBe(1);
  expect(decoded.is_approved).toBe(1);
});

test('POST /auth/login uses default "+91" when country_code omitted', async () => {
  // Our seeded user has country_code '+91', so omitting should still authenticate
  const res = await request(app)
    .post('/auth/login')
    .send({ phone_number: '9990011223' });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(typeof res.body.token).toBe('string');

  const decoded = jwt.verify(res.body.token, 'supersecret');
  expect(decoded.id).toBe(userId);
  expect(decoded.role).toBe('user');
});
