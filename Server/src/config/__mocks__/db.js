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
