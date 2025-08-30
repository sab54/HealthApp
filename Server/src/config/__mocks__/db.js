/**
 * database.js
 *
 * This file sets up an in-memory SQLite database for testing purposes. The database mimics the production database
 * structure and includes a method to close the connection (`db.closeConnection()`). It uses the `sqlite3` library to 
 * interact with the SQLite database.
 *
 * Features:
 * - Creates an in-memory SQLite database for testing, ensuring that the database is ephemeral and cleared after each test.
 * - Defines a `closeConnection` method to close the database connection gracefully using Promises.
 * - Logs an error message if the database connection fails.
 *
 * This file uses the following libraries:
 * - `sqlite3`: A library for interacting with SQLite databases in Node.js.
 *
 * Dependencies:
 * - sqlite3
 *
 * Author: Sunidhi Abhange
 */

const sqlite3 = require('sqlite3').verbose();

/**
 * Test DB (in-memory)
 * Matches production API: db + db.closeConnection()
 */
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Test DB connection error:', err.message);
  }
});

db.closeConnection = () =>
  new Promise((resolve, reject) => {
    db.close((err) => (err ? reject(err) : resolve()));
  });

module.exports = db;
