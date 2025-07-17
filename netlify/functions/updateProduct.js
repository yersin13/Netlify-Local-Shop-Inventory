const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../db.sqlite');
const db = new sqlite3.Database(dbPath);

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const id = event.queryStringParameters.id;
  const { name, price, quantity, category } = JSON.parse(event.body);

  if (!id || !name || price == null || quantity == null) {
    return {
      statusCode: 400,
      body: 'Missing required fields',
    };
  }

  const query = `UPDATE products SET name = ?, price = ?, quantity = ?, category = ? WHERE id = ?`;
  const values = [name, price, quantity, category, id];

  return new Promise((resolve) => {
    db.run(query, values, function (err) {
      if (err) {
        return resolve({
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to update product' }),
        });
      }

      resolve({
        statusCode: 200,
        body: JSON.stringify({ id, name, price, quantity, category }),
      });
    });
  });
};
