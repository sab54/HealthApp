const express = require('express');
const initSchema = require('../src/migrations/initSchema');
const db = require('../src/config/db'); // mocked in tests

function buildTestApp(mountRoutes) {
  const app = express();
  app.use(express.json());

  // Run schema once for the test DB
  initSchema();

  if (typeof mountRoutes === 'function') {
    mountRoutes({ app, db });
  }

  return { app, db };
}

module.exports = { buildTestApp };
