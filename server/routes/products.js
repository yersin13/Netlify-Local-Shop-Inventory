const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ POST /products
router.post('/', (req, res) => {
 const { name, price, quantity, category } = req.body;

  if (!name || price == null || quantity == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

 const query = 'INSERT INTO products (name, price, quantity, category) VALUES (?, ?, ?, ?)';
const values = [name, price, quantity, category];

  db.run(query, values, function (err) {
    if (err) {
      console.error('[INSERT] Error:', err.message);
      return res.status(500).json({ error: 'Failed to add product' });
    }

    console.log(`[INSERT] New product added with ID ${this.lastID}`);
    res.status(201).json({ id: this.lastID, name, price, quantity });
  });
});

// ✅ GET /products
router.get('/', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// ✅ DELETE product by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('[DELETE] Error:', err.message);
      return res.status(500).json({ error: 'Failed to delete product' });
    }

    console.log(`[DELETE] Product with ID ${id} deleted`);
    res.status(200).json({ success: true });
  });
});


// ✅ Update /products
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, quantity, category } = req.body;

 const query = `UPDATE products SET name = ?, price = ?, quantity = ?, category = ? WHERE id = ?`;
const values = [name, price, quantity, category, req.params.id];
  db.run(query, values, function (err) {
    if (err) {
      console.error('[UPDATE] Error:', err.message);
      return res.status(500).json({ error: 'Failed to update product' });
    }

    console.log(`[UPDATE] Product with ID ${id} updated`);
    res.json({ id, name, price, quantity });
  });
});

module.exports = router;
