/**
 * userSteps.test.js
 *
 * What This Test File Covers:
 *
 * 1. Insert new steps record
 *    - Ensures first submission for the day inserts a row.
 *
 * 2. Update existing steps record
 *    - Only updates if `steps` is greater than previous value.
 *
 * 3. No update if steps do not increase
 *    - Confirms that same or lower step counts return existing row unchanged.
 *
 * 4. Fetch daily totals
 *    - Ensures `/daily/:user_id` returns aggregated history.
 */

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

jest.mock('../../src/config/db');
const db = require('../../src/config/db');
const initSchema = require('../../src/migrations/initSchema');
const userStepsRouter = require('../../src/routes/stepsTracker');

let app;

beforeAll((done) => {
  db.serialize(() => {
    initSchema();
    app = express();
    app.use(bodyParser.json());
    app.use('/steps', userStepsRouter(db));
    done();
  });
});

afterAll(async () => {
  await db.closeConnection();
});

test('insert new steps record', async () => {
  const res = await request(app)
    .post('/steps')
    .send({ user_id: 1, steps: 1000, distance: 0.8, speed: 1.2, calories: 50, duration: 10 });

  expect(res.statusCode).toBe(200);
  expect(res.body.user_id).toBe(1);
  expect(res.body.steps).toBe(1000);
});

test('update existing steps record when steps increase', async () => {
  // First insert baseline
  await request(app)
    .post('/steps')
    .send({ user_id: 2, steps: 500, distance: 0.5, speed: 1.0, calories: 30, duration: 5 });

  // Then update with higher steps
  const res = await request(app)
    .post('/steps')
    .send({ user_id: 2, steps: 800, distance: 0.7, speed: 1.1, calories: 40, duration: 7 });

  expect(res.statusCode).toBe(200);
  expect(res.body.steps).toBe(800);
});

test('do not update if steps are lower or same', async () => {
  // First insert
  await request(app)
    .post('/steps')
    .send({ user_id: 3, steps: 600, distance: 0.6, speed: 1.0, calories: 35, duration: 6 });

  // Try posting lower steps
  const res = await request(app)
    .post('/steps')
    .send({ user_id: 3, steps: 400, distance: 0.4, speed: 0.9, calories: 20, duration: 4 });

  expect(res.statusCode).toBe(200);
  expect(res.body.steps).toBe(600); // unchanged
});

test('fetch daily totals', async () => {
  const res = await request(app).get('/steps/daily/1');

  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  if (res.body.length > 0) {
    expect(res.body[0]).toHaveProperty('day');
    expect(res.body[0]).toHaveProperty('total_steps');
  }
});
