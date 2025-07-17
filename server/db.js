// server/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open the database file
const db = new sqlite3.Database(path.join(__dirname, 'data.sqlite'), (err) => {
  if (err) {
    console.error('[DB] Connection error:', err.message);
  } else {
    console.log('[DB] Connected to SQLite database');
  }
});

module.exports = db;
