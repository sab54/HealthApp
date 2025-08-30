/**
 * Test App Builder (buildTestApp.js)
 *
 * This file defines a utility for building a test application, which can be used to 
 * set up a test environment with the necessary database schema and routes. It allows 
 * the testing of routes and database interactions in isolation using the provided test database.
 * 
 * Features:
 * - Schema Initialization: Ensures that the test database schema is initialized before running tests.
 * - Route Mounting: Optionally mounts routes on the app for testing, allowing for flexible route integration.
 * - JSON Body Parsing: Configures Express to parse JSON request bodies for test requests.
 * 
 * Key Functionality:
 * - `buildTestApp`: Creates an Express app with the necessary configurations for testing, 
 *   including schema initialization and route mounting (if provided).
 *   - Initializes the database schema using `initSchema()`.
 *   - Optionally mounts routes using the provided `mountRoutes` function.
 * 
 * Dependencies:
 * - express: Web framework used to build the test application.
 * - initSchema: Responsible for initializing the test database schema.
 * - db: The test database connection used during tests.
 * 
 * Author: Sunidhi Abhange
 */

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
