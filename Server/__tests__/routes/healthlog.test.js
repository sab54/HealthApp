/**
 * healthlog.test.js
 *
 * What This Test File Covers:
 *
 * 1. Healthcheck
 *    - Verifies the base route responds with success.
 *
 * 2. "Today" Endpoint (Empty State)
 *    - Ensures it returns null mood/sleep/energy and an empty symptoms array when no entries exist for today.
 *
 * 3. Submit Mood & Symptoms
 *    - Saves a valid mood and one symptom; confirms DB persistence and normalized severity handling.
 *
 * 4. Generate Daily Plan
 *    - Generates today's plan from mocked symptomHealth data and persists tasks to user_daily_plan.
 */

const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// Use an in-memory DB compatible with initSchema; expose closeConnection for teardown
jest.mock('../../src/config/db', () => {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(':memory:');
  db.closeConnection = () => new Promise((resolve) => db.close(resolve));
  return db;
});

// Mock symptomHealth data used by /generatePlan
jest.mock('../../src/data/symptomHealth', () => [
  {
    symptom: 'Fever',
    severity_levels: {
      mild: {
        precautions: ['Hydrate well'],
        medicines: ['Paracetamol 250mg'],
        what_to_eat: ['Light soups'],
        exercises: [],
        what_not_to_take: ['Alcohol'],
        treatment: 'Rest adequately'
      },
      moderate: {
        precautions: ['Rest', 'Monitor temperature'],
        medicines: ['Paracetamol 500mg'],
        what_to_eat: ['Broth'],
        exercises: [],
        what_not_to_take: ['Alcohol'],
        treatment: 'Cool compress'
      },
      severe: {
        precautions: ['Seek medical attention'],
        medicines: ['Consult doctor'],
        what_to_eat: [],
        exercises: [],
        what_not_to_take: [],
        treatment: 'ER if >40°C'
      }
    }
  }
]);

const db = require('../../src/config/db');
const initSchema = require('../../src/migrations/initSchema');
const healthlogFactory = require('../../src/routes/healthlog');

let app;
let userId;

const todayISO = () => new Date().toISOString().split('T')[0];

beforeAll((done) => {
  db.serialize(() => {
    initSchema(); // run production schema on in-memory DB

    // Insert a baseline user WITHOUT forcing the id to avoid UNIQUE conflicts
    db.run(
      `INSERT INTO users (phone_number, first_name, role) VALUES (?, ?, ?)`,
      ['1002003000', 'Alice', 'user'],
      function (err) {
        if (err) return done(err);
        userId = this.lastID; // capture generated id

        app = express();
        app.use(express.json());
        app.use('/', healthlogFactory(db));
        done();
      }
    );
  });
});

afterAll(async () => {
  await db.closeConnection();
});

beforeEach((done) => {
  // Clear daily tables between tests; keep users as-is
  db.serialize(() => {
    db.run(`DELETE FROM user_daily_mood`);
    db.run(`DELETE FROM user_symptoms`);
    db.run(`DELETE FROM user_daily_plan`, done);
  });
});

test('GET / returns healthcheck JSON', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    success: true,
    message: 'Healthlog API is working'
  });
});

test('GET /today/:userId returns empty state when no entries for today', async () => {
  const res = await request(app).get(`/today/${userId}`);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.mood).toBeNull();
  expect(res.body.sleep).toBeNull();
  expect(res.body.energy).toBeNull();
  expect(Array.isArray(res.body.symptoms)).toBe(true);
  expect(res.body.symptoms.length).toBe(0);
});

test('POST /submit saves mood and inserts new symptom with normalized severity', async () => {
  const payload = {
    user_id: userId,
    mood: 'Feeling great!',
    sleep: 7,
    energy: 6,
    symptoms: [
      {
        symptom: 'Headache',
        severity_level: 'Moderate', // should normalize to 'moderate'
        onsetTime: '08:00',
        duration: '2h',
        notes: 'Throbbing'
      }
    ]
  };

  const res = await request(app).post('/submit').send(payload);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);

  // Verify daily mood persisted
  await new Promise((resolve, reject) => {
    db.get(
      `SELECT mood, sleep, energy FROM user_daily_mood WHERE user_id = ? AND date = ?`,
      [userId, todayISO()],
      (err, row) => {
        if (err) return reject(err);
        try {
          expect(row).toBeTruthy();
          expect(row.mood).toBe('Feeling great!');
          expect(row.sleep).toBe(7);
          expect(row.energy).toBe(6);
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    );
  });

  // Verify symptom inserted once with normalized severity
  await new Promise((resolve, reject) => {
    db.all(
      `SELECT symptom, severity, date FROM user_symptoms WHERE user_id = ? AND date = ?`,
      [userId, todayISO()],
      (err, rows) => {
        if (err) return reject(err);
        try {
          expect(rows.length).toBe(1);
          expect(rows[0].symptom).toBe('Headache');
          expect(rows[0].severity).toBe('moderate');
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    );
  });
});

test('POST /generatePlan creates tasks for today and returns plan content', async () => {
  const res = await request(app)
    .post('/generatePlan')
    .send({ user_id: userId, symptom: 'Fever', severity: 'moderate' });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.plan).toBeTruthy();
  expect(typeof res.body.plan).toBe('object');
  expect(res.body.plan.medicines).toBeDefined();

  // Give a short tick for queued inserts inside the route to complete
  await new Promise((r) => setTimeout(r, 30));

  await new Promise((resolve, reject) => {
    db.all(
      `SELECT category, task, severity, symptom, date
       FROM user_daily_plan
       WHERE user_id = ? AND date = ? AND symptom = ? AND severity = ?`,
      [userId, todayISO(), 'Fever', 'moderate'],
      (err, rows) => {
        if (err) return reject(err);
        try {
          expect(rows.length).toBeGreaterThan(0);
          const categories = new Set(rows.map((r) => r.category));
          expect(
            [...categories].every((c) =>
              ['Care', 'Medicine', 'Diet', 'Exercise', 'Avoid'].includes(c)
            )
          ).toBe(true);
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    );
  });
});
