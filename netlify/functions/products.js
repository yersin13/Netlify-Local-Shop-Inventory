const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Reference to SQLite DB in the current project folder
const dbPath = path.resolve(__dirname, '../../db.sqlite');
const db = new sqlite3.Database(dbPath);

exports.handler = async function (event, context) {
  if (event.httpMethod === 'GET') {
    return new Promise((resolve) => {
      db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
          return resolve({
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
          });
        }
        resolve({
          statusCode: 200,
          body: JSON.stringify(rows),
        });
      });
    });
  }

  if (event.httpMethod === 'POST') {
    const { name, price, quantity, category } = JSON.parse(event.body);
    return new Promise((resolve) => {
      const query = 'INSERT INTO products (name, price, quantity, category) VALUES (?, ?, ?, ?)';
      const values = [name, price, quantity, category];

      db.run(query, values, function (err) {
        if (err) {
          return resolve({
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to add product' }),
          });
        }

        resolve({
          statusCode: 201,
          body: JSON.stringify({ id: this.lastID, name, price, quantity, category }),
        });
      });
    });
  }

  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
