/**
 * license.test.js
 *
 * What This Test File Covers:
 *
 * 1. Approval Path (Happy Path)
 *    - OCR detects a valid doctor marker -> inserts into doctor_licenses, updates users,
 *      returns 200 with approved=true, and deletes temp file.
 *
 * 2. Rejection Path (Invalid License)
 *    - OCR text lacks doctor markers -> no DB writes, returns 400 with approved=false,
 *      and deletes temp file.
 *
 * 3. Missing user_id
 *    - Validates payload, removes temp file, returns 400 with message.
 *
 * 4. OCR Error Handling
 *    - OCR throws -> returns 500 and deletes temp file.
 *
 * Note:
 * - We avoid importing the project DB or its manual mocks to prevent loading sqlite3.
 * - We still refer to the production schema file by asserting that migrations/initSchema.js exists.
 */

const request = require('supertest');
const express = require('express');

// Mock fs to avoid real disk I/O during route cleanup
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  unlinkSync: jest.fn(),
}));

// Mock multer to inject a fake upload without real multipart handling
jest.mock('multer', () => {
  return () =>
    ({
      single:
        () =>
        (req, _res, next) => {
          req.file = {
            path: '/tmp/fake-image.png',
            filename: 'fake-image.png',
          };
          next();
        },
    });
});

// Mock Tesseract to control OCR outcomes
jest.mock('tesseract.js', () => ({
  recognize: jest.fn(),
}));

const fs = require('fs');
const Tesseract = require('tesseract.js');

// Import the router under test; we’ll pass a lightweight db double into it
const uploadLicenseRouter = require('../../src/routes/license');

// Lightweight db double that records calls to run(sql, params, cb)
function makeDbDouble() {
  const calls = [];
  return {
    _calls: calls,
    run(sql, params, cb) {
      calls.push({ sql, params });
      // simulate async sqlite callback success
      setImmediate(() => cb && cb(null));
    },
  };
}

function makeAppWith(dbDouble) {
  const app = express();
  app.use(express.json());
  app.use(uploadLicenseRouter(dbDouble));
  return app;
}

test('schema file exists (reference to production schema initSchema.js)', () => {
  const realFs = jest.requireActual('fs');
  const schemaPath = require('path').join(__dirname, '../../src/migrations/initSchema.js');
  expect(realFs.existsSync(schemaPath)).toBe(true);
});

test('approves and saves when OCR indicates doctor license', async () => {
  Tesseract.recognize.mockResolvedValueOnce({
    data: { text: 'Dr. Jane Doe\nLicense: DOC-1234-ABC\n' },
  });

  const dbDouble = makeDbDouble();
  const app = makeAppWith(dbDouble);

  const res = await request(app).post('/upload-license').send({ user_id: 77 });

  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({
    success: true,
    approved: true,
    message: 'License approved and saved successfully.',
  });
  expect(typeof res.body.ocrText).toBe('string');

  // Two DB operations: insert license, update user approval
  expect(dbDouble._calls.length).toBe(2);
  expect(dbDouble._calls[0].sql).toMatch(/INSERT\s+INTO\s+doctor_licenses/i);
  expect(dbDouble._calls[0].params).toEqual([77, '/uploads/fake-image.png', 'approved']);
  expect(dbDouble._calls[1].sql).toMatch(/UPDATE\s+users\s+SET\s+is_approved\s*=\s*1/i);
  expect(dbDouble._calls[1].params).toEqual([77]);

  // Temp file cleanup
  expect(fs.existsSync).toHaveBeenCalledWith('/tmp/fake-image.png');
  expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/fake-image.png');
});

test('rejects with 400 when OCR text lacks doctor indicators', async () => {
  Tesseract.recognize.mockResolvedValueOnce({
    data: { text: 'Hello world. Sample image with random text.' },
  });

  const dbDouble = makeDbDouble();
  const app = makeAppWith(dbDouble);

  const res = await request(app).post('/upload-license').send({ user_id: 88 });

  expect(res.status).toBe(400);
  expect(res.body).toMatchObject({
    success: false,
    approved: false,
    message: 'License does not appear to be valid.',
  });
  expect(typeof res.body.ocrText).toBe('string');

  // No DB writes on rejection
  expect(dbDouble._calls.length).toBe(0);

  // Temp file cleanup
  expect(fs.existsSync).toHaveBeenCalledWith('/tmp/fake-image.png');
  expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/fake-image.png');
});

test('400 when user_id is missing (and temp file removed)', async () => {
  // OCR is not reached; multer injects a file which should be cleaned up
  const dbDouble = makeDbDouble();
  const app = makeAppWith(dbDouble);

  const res = await request(app).post('/upload-license').send({});

  expect(res.status).toBe(400);
  expect(res.body).toMatchObject({
    success: false,
    message: 'Missing user_id',
  });

  // No DB writes
  expect(dbDouble._calls.length).toBe(0);

  // Temp file cleanup
  expect(fs.existsSync).toHaveBeenCalledWith('/tmp/fake-image.png');
  expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/fake-image.png');
});

test('500 when OCR processing throws (and temp file removed)', async () => {
  Tesseract.recognize.mockRejectedValueOnce(new Error('OCR engine failed'));

  const dbDouble = makeDbDouble();
  const app = makeAppWith(dbDouble);

  const res = await request(app).post('/upload-license').send({ user_id: 99 });

  expect(res.status).toBe(500);
  expect(res.body).toMatchObject({
    success: false,
    message: 'OCR processing failed',
  });

  // No DB writes when OCR fails
  expect(dbDouble._calls.length).toBe(0);

  // Temp file cleanup
  expect(fs.existsSync).toHaveBeenCalledWith('/tmp/fake-image.png');
  expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/fake-image.png');
});
