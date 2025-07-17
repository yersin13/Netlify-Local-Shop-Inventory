const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../db.sqlite');
const db = new sqlite3.Database(dbPath);

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const id = event.queryStringParameters.id;

  if (!id) {
    return {
      statusCode: 400,
      body: 'Missing product ID',
    };
  }

  return new Promise((resolve) => {
    db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
      if (err) {
        return resolve({
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to delete product' }),
        });
      }

      resolve({
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      });
    });
  });
};
