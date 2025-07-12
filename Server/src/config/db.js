const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
  path.resolve(__dirname, '../../users.db'), // ✅ Make sure this path is correct
  (err) => {
    if (err) return console.error('❌ DB connection error:', err.message);
    console.log('✅ Connected to SQLite database');
  }
);


// Optional method to close
db.closeConnection = () => {
  db.close((err) => {
    if (err) console.error('❌ Failed to close DB:', err.message);
    else console.log('🔒 SQLite DB connection closed');
  });
};

module.exports = db;
