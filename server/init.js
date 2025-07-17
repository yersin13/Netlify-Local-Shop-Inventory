// server/init.js
const db = require('./db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER,
      price REAL,
      category TEXT
    )
  `, (err) => {
    if (err) {
      console.error('[INIT] Table creation error:', err.message);
    } else {
      console.log('[INIT] Products table created or exists already');
    }
  });
});