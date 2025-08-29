/**
 * authMiddleware.test.js
 *
 * What This Test File Covers:
 *
 * 1. Missing/Invalid Token Handling
 *    - 401 when no Authorization header.
 *    - 401 when token is invalid.
 *
 * 2. Successful Auth (No Role Required)
 *    - 200 when a valid token is provided; middleware attaches req.user.
 *
 * 3. Role-Based Authorization
 *    - 403 when role does not match requiredRole.
 *    - 200 when role matches requiredRole.
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middleware/authMiddleware');

// Ensure the same secret as middleware uses
process.env.JWT_SECRET = 'supersecret';

let app;

beforeAll(() => {
  app = express();
  app.get('/protected', authMiddleware(), (req, res) => {
    // Echo back what middleware attached
    res.json({ success: true, user: req.user });
  });
  app.get('/admin', authMiddleware('admin'), (req, res) => {
    res.json({ success: true, role: req.user.role });
  });
});

test('401 when no Authorization header', async () => {
  const res = await request(app).get('/protected');
  expect(res.status).toBe(401);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe('No token provided');
});

test('401 when token is invalid', async () => {
  const res = await request(app)
    .get('/protected')
    .set('Authorization', 'Bearer not.a.valid.token');
  expect(res.status).toBe(401);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe('Invalid token');
});

test('200 and user attached when valid token provided (no role required)', async () => {
  const token = jwt.sign({ id: 1, role: 'user' }, 'supersecret', { expiresIn: '1h' });
  const res = await request(app)
    .get('/protected')
    .set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.user).toBeDefined();
  expect(res.body.user.id).toBe(1);
  expect(res.body.user.role).toBe('user');
});

test('role enforcement: 403 for mismatch, 200 for match', async () => {
  const userToken = jwt.sign({ id: 2, role: 'user' }, 'supersecret', { expiresIn: '1h' });
  const adminToken = jwt.sign({ id: 3, role: 'admin' }, 'supersecret', { expiresIn: '1h' });

  // Mismatch -> 403
  const resForbidden = await request(app)
    .get('/admin')
    .set('Authorization', `Bearer ${userToken}`);
  expect(resForbidden.status).toBe(403);
  expect(resForbidden.body.success).toBe(false);
  expect(resForbidden.body.message).toBe('Forbidden');

  // Match -> 200
  const resOk = await request(app)
    .get('/admin')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(resOk.status).toBe(200);
  expect(resOk.body.success).toBe(true);
  expect(resOk.body.role).toBe('admin');
});
