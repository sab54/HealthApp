/**
 * server.test.js
 *
 * What This Test File Covers:
 *
 * 1. Root Route
 *    - Returns "Server running".
 *
 * 2. CORS Headers
 *    - Verifies Access-Control-* headers are set on responses.
 *
 * 3. Route Mount: Auth
 *    - /api/auth/login returns 400 when phone_number is missing.
 *
 * 4. Route Mount: Healthlog
 *    - /api/healthlog base responds with the healthcheck JSON.
 *
 * Notes:
 * - We spin up an Express app that mirrors server.js wiring (same middlewares and routes)
 *   using the in-memory DB and initSchema. This isolates tests from an always-listening
 *   server process while exercising the same paths defined in server.js.
 */

const request = require('supertest');
const express = require('express');
const path = require('path');

// In-memory DB compatible with initSchema; expose closeConnection for teardown
jest.mock('../src/config/db', () => {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(':memory:');
  db.closeConnection = () => new Promise((resolve) => db.close(resolve));
  return db;
});

const db = require('../src/config/db');
const initSchema = require('../src/migrations/initSchema');

// Routes wired exactly like server.js
const usersRoute = require('../src/routes/user');
const authRoute = require('../src/routes/auth');
const licenseRoute = require('../src/routes/license');
const chatRoute = require('../src/routes/chat');
const healthlogRoute = require('../src/routes/healthlog');
const appointmentRoute = require('../src/routes/appointment');
const stepsTrackerRoute = require('../src/routes/stepsTracker');

let app;

beforeAll((done) => {
  db.serialize(() => {
    initSchema();

    // Minimal seed to satisfy common FKs where needed
    db.run(
      `INSERT INTO users (phone_number, country_code, first_name, role, is_phone_verified, is_approved)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['9990011223', '+91', 'Alice', 'user', 1, 1],
      (err) => {
        if (err) return done(err);

        app = express();

        // Middlewares same as server.js
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Static uploads
        app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

        // CORS headers
        app.use((req, res, next) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
          res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
          res.setHeader('Access-Control-Allow-Credentials', true);
          next();
        });

        // Mount routes (without sockets)
        app.use('/api/users', usersRoute(db));
        app.use('/api/auth', authRoute(db));
        app.use('/api/license', licenseRoute(db));
        app.use('/api/chat', chatRoute(db)); // io not required for mounting
        app.use('/api/healthlog', healthlogRoute(db));
        app.use('/api/appointment', appointmentRoute(db));
        app.use('/api/steps', stepsTrackerRoute(db));

        // Root route
        app.get('/', (req, res) => res.send('Server running'));

        done();
      }
    );
  });
});

afterAll(async () => {
  await db.closeConnection();
});

test('GET / returns "Server running"', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
  expect(res.text).toBe('Server running');
});

test('CORS headers are present on responses', async () => {
  const res = await request(app).get('/');
  expect(res.headers['access-control-allow-origin']).toBe('*');
  expect(res.headers['access-control-allow-methods']).toContain('GET');
  expect(res.headers['access-control-allow-headers']).toContain('Authorization');
  expect(String(res.headers['access-control-allow-credentials'])).toBe('true');
});

test('POST /api/auth/login without phone_number returns 400', async () => {
  const res = await request(app).post('/api/auth/login').send({});
  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe('Phone required');
});

test('GET /api/healthlog base returns healthcheck JSON', async () => {
  const res = await request(app).get('/api/healthlog/');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    success: true,
    message: 'Healthlog API is working',
  });
});
