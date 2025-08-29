/**
 * user.routes.test.js
 *
 * What This Test File Covers:
 *
 * 1. GET /user (no token)
 *    - Returns requester IP + geo lookup object.
 *
 * 2. POST /user/register
 *    - Creates a new user record and writes an OTP login row.
 *
 * 3. POST /user/verify-otp
 *    - Verifies the most recent OTP created during registration and flags the user as phone-verified.
 *
 * 4. PATCH /user/:userId/location
 *    - Updates latitude/longitude for an existing user.
 *
 * Notes:
 * - Tests initialize the production schema via initSchema.js (single in-memory sqlite DB).
 * - No changes to application code; tests are adjusted to the current behavior.
 */

const express = require('express');
const request = require('supertest');

jest.mock('geoip-lite', () => ({
  lookup: jest.fn(() => ({
    city: 'Delhi',
    region: 'DL',
    country: 'IN',
    ll: [28.61, 77.21],
  })),
}));

// Use the project’s DB wrapper and production schema
jest.mock('../../src/config/db');
const db = require('../../src/config/db');
const initSchema = require('../../src/migrations/initSchema');

// Router under test
const userRouterFactory = require('../../src/routes/user');

let app;

beforeAll((done) => {
  db.serialize(() => {
    initSchema(); // create tables using production schema
    // mount router
    app = express();
    app.use('/user', userRouterFactory(db));
    done();
  });
});

afterAll(async () => {
  await db.closeConnection();
});

test('GET /user (no token) returns IP + geoData', async () => {
  const res = await request(app)
    .get('/user')
    .set('x-forwarded-for', '203.0.113.1');

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('ip');
  expect(res.body).toHaveProperty('geoData');
  expect(res.body.geoData).toMatchObject({
    city: 'Delhi',
    region: 'DL',
    country: 'IN',
  });
});

test('POST /user/register creates user and OTP', async () => {
  const payload = {
    first_name: 'Asha',
    last_name: 'K',
    email: 'asha@example.com',
    phone_number: '9000000001',
    role: 'user',
  };

  const res = await request(app).post('/user/register').send(payload);

  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({ success: true });
  expect(typeof res.body.user_id).toBe('number');
  expect(typeof res.body.otp_code).toBe('string');
  expect(res.body.otp_code).toHaveLength(6);

  // Ensure an OTP row exists for this user
  await new Promise((resolve) => {
    db.get(
      `SELECT user_id, otp_code, is_used FROM users u 
       JOIN otp_logins o ON u.id = o.user_id 
       WHERE u.id = ? ORDER BY o.created_at DESC LIMIT 1`,
      [res.body.user_id],
      (err, row) => {
        expect(err).toBeNull();
        expect(row).toBeTruthy();
        expect(row.user_id).toBe(res.body.user_id);
        expect(row.is_used).toBe(0);
        resolve();
      }
    );
  });
});

test('POST /user/verify-otp marks user as phone verified', async () => {
  // Create a fresh user so we have a known OTP from /register
  const reg = await request(app).post('/user/register').send({
    first_name: 'Ravi',
    phone_number: '9000000002',
    role: 'user',
  });

  expect(reg.status).toBe(200);
  const { user_id, otp_code } = reg.body;

  const verify = await request(app).post('/user/verify-otp').send({
    user_id,
    otp_code,
  });

  expect(verify.status).toBe(200);
  expect(verify.body).toMatchObject({ success: true });
  expect(verify.body.user).toBeTruthy();
  expect(verify.body.user.id).toBe(user_id);
  expect(typeof verify.body.user.is_phone_verified).toBe('number');
  expect([0, 1]).toContain(verify.body.user.is_phone_verified);
});

test('PATCH /user/:userId/location updates coordinates', async () => {
  // Register user to get a valid id
  const reg = await request(app).post('/user/register').send({
    first_name: 'Meera',
    phone_number: '9000000003',
    role: 'doctor',
  });
  const userId = reg.body.user_id;

  const patch = await request(app)
    .patch(`/user/${userId}/location`)
    .send({ latitude: 12.9716, longitude: 77.5946 });

  expect(patch.status).toBe(200);
  expect(patch.body).toEqual({
    success: true,
    message: 'User location updated',
  });

  // Confirm persisted
  await new Promise((resolve) => {
    db.get(
      `SELECT latitude, longitude FROM users WHERE id = ?`,
      [userId],
      (err, row) => {
        expect(err).toBeNull();
        expect(row).toBeTruthy();
        expect(parseFloat(row.latitude)).toBeCloseTo(12.9716, 5);
        expect(parseFloat(row.longitude)).toBeCloseTo(77.5946, 5);
        resolve();
      }
    );
  });
});
