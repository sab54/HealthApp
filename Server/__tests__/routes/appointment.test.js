/**
 * appointment.test.js
 *
 * What This Test File Covers:
 *
 * 1. AI Book (Happy Path)
 *    - Creates an appointment with valid payload; verifies normalized response and DB persistence.
 *
 * 2. Get Appointments For User
 *    - Returns the created appointment and includes joined user name fields.
 *
 * 3. Patch Appointment (Update Fields)
 *    - Updates date/time only (status may not exist in schema); confirms one row changed and values persisted.
 *
 * 4. Validation Errors
 *    - ai-book: 400 on missing required fields
 *    - get: 400 on invalid userId
 *    - patch: 400 when no fields to update
 */

const request = require('supertest');
const express = require('express');

// Use an in-memory DB compatible with initSchema; expose closeConnection for teardown
jest.mock('../../src/config/db', () => {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(':memory:');
  db.closeConnection = () => new Promise((resolve) => db.close(resolve));
  return db;
});

const db = require('../../src/config/db');
const initSchema = require('../../src/migrations/initSchema');
const appointmentRoutes = require('../../src/routes/appointment');

let app;
let userA; // recipient / patient
let userB; // sender / requester
let chatId;

beforeAll((done) => {
  db.serialize(() => {
    initSchema(); // run production schema on in-memory DB

    // Seed users (let DB assign ids)
    db.run(
      `INSERT INTO users (phone_number, first_name, role) VALUES (?, ?, ?)`,
      ['1111111111', 'Alice', 'user'],
      function (err) {
        if (err) return done(err);
        userA = this.lastID;

        db.run(
          `INSERT INTO users (phone_number, first_name, role) VALUES (?, ?, ?)`,
          ['2222222222', 'Bob', 'user'],
          function (err2) {
            if (err2) return done(err2);
            userB = this.lastID;

            // Seed a chat and membership to satisfy potential FKs in appointment.chat_id
            db.run(
              `INSERT INTO chats (is_group, name, created_by) VALUES (0, NULL, ?)`,
              [userA],
              function (err3) {
                if (err3) return done(err3);
                chatId = this.lastID;

                db.run(
                  `INSERT INTO chat_members (chat_id, user_id, role) VALUES (?, ?, 'owner')`,
                  [chatId, userA],
                  (err4) => {
                    if (err4) return done(err4);
                    db.run(
                      `INSERT INTO chat_members (chat_id, user_id, role) VALUES (?, ?, 'member')`,
                      [chatId, userB],
                      (err5) => {
                        if (err5) return done(err5);

                        app = express();
                        app.use(express.json());
                        app.use('/appointment', appointmentRoutes(db));
                        done();
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

afterAll(async () => {
  await db.closeConnection();
});

beforeEach((done) => {
  // Truncate appointment table between tests; keep users/chats
  db.serialize(() => {
    db.run(`DELETE FROM appointment`, done);
  });
});

test('POST /appointment/ai-book creates an appointment (happy path)', async () => {
  const payload = {
    date: '2030-01-02',
    time: '10:30',
    reason: 'Routine checkup',
    userId: userA,
    senderId: userB,
    createdBy: userB,
    chatId: chatId
  };

  const res = await request(app).post('/appointment/ai-book').send(payload);

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.appointments)).toBe(true);
  expect(res.body.appointments.length).toBe(1);

  const appt = res.body.appointments[0];
  expect(appt.user_id).toBe(userA);
  expect(appt.sender_id).toBe(userB);
  expect(appt.chat_id).toBe(chatId);
  expect(appt.date).toBe('2030-01-02');
  expect(appt.time).toBe('10:30');
  expect(appt.reason).toBe('Routine checkup');
  expect(appt.id).toBeGreaterThan(0);
});

test('GET /appointment/:userId returns appointments for that user with joined names', async () => {
  // Create one appointment first
  await request(app).post('/appointment/ai-book').send({
    date: '2030-02-10',
    time: '14:00',
    reason: 'Follow-up',
    userId: userA,
    senderId: userB,
    createdBy: userB,
    chatId
  });

  const res = await request(app).get(`/appointment/${userA}`);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.appointments)).toBe(true);
  expect(res.body.appointments.length).toBe(1);

  const appt = res.body.appointments[0];
  expect(appt.user_id).toBe(userA);
  expect(appt.sender_id).toBe(userB);
  // Joined user names should be present (may be null-safe but should exist in row)
  expect(Object.prototype.hasOwnProperty.call(appt, 'user_first_name')).toBe(true);
  expect(Object.prototype.hasOwnProperty.call(appt, 'sender_first_name')).toBe(true);
});

test('PATCH /appointment/:id updates date and time (status may not exist in schema)', async () => {
  // Create appointment
  const { body } = await request(app).post('/appointment/ai-book').send({
    date: '2030-03-05',
    time: '09:15',
    reason: 'Consult',
    userId: userA,
    senderId: userB,
    createdBy: userB,
    chatId
  });
  const apptId = body.appointments[0].id;

  // Update only date & time to avoid touching possibly absent columns
  const patchRes = await request(app)
    .patch(`/appointment/${apptId}`)
    .send({ date: '2030-03-06', time: '11:00' });

  expect(patchRes.status).toBe(200);
  expect(patchRes.body.success).toBe(true);
  expect(patchRes.body.updatedRows).toBe(1);

  // Fetch and verify
  const list = await request(app).get(`/appointment/${userA}`);
  const updated = list.body.appointments.find((a) => a.id === apptId);
  expect(updated.date).toBe('2030-03-06');
  expect(updated.time).toBe('11:00');
});

test('Validation: ai-book missing fields 400; get invalid userId 400; patch with no fields 400', async () => {
  // ai-book missing fields
  const badCreate = await request(app).post('/appointment/ai-book').send({
    // missing required fields like time/createdBy/chatId/senderId...
    date: '2030-04-01',
    reason: 'x',
    userId: userA
  });
  expect(badCreate.status).toBe(400);
  expect(badCreate.body.success).toBe(false);

  // get invalid userId
  const badGet = await request(app).get('/appointment/not-a-number');
  expect(badGet.status).toBe(400);
  expect(badGet.body.success).toBe(false);

  // patch with no fields
  // Create one appointment to have an id
  const { body } = await request(app).post('/appointment/ai-book').send({
    date: '2030-04-02',
    time: '12:00',
    reason: 'x',
    userId: userA,
    senderId: userB,
    createdBy: userB,
    chatId
  });
  const id = body.appointments[0].id;

  const badPatch = await request(app).patch(`/appointment/${id}`).send({});
  expect(badPatch.status).toBe(400);
  expect(badPatch.body.success).toBe(false);
  expect(badPatch.body.message).toBe('No fields to update');
});
