// Server/src/config/db.js
/**
 * db.js
 *
 * This file sets up the SQLite database connection for the server using the `sqlite3` library. It establishes a
 * connection to the SQLite database file (`trustcura.db`) and provides a method to close the database connection
 * gracefully. The connection details are logged to the console upon successful connection.
 *
 * Features:
 * - Establishes a connection to an SQLite database located at the specified path (`trustcura.db`).
 * - Defines a `closeConnection` method to close the database connection and log any errors or success messages.
 * - Logs an error message if the database connection fails and logs a success message on successful connection.
 *
 * This file uses the following libraries:
 * - `sqlite3`: A library for interacting with SQLite databases in Node.js.
 * - `path`: A core Node.js module to resolve and join file paths.
 *
 * Dependencies:
 * - sqlite3
 * - path
 *
 * Author: Sunidhi Abhange
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
  path.resolve(__dirname, '../../trustcura.db'),
  (err) => {
    if (err) return console.error('DB connection error:', err.message);
    console.log('Connected to SQLite database');
  }
);

db.closeConnection = () => {
  db.close((err) => {
    if (err) console.error('Failed to close DB:', err.message);
    else console.log('SQLite DB connection closed');
  });
};

module.exports = db;
