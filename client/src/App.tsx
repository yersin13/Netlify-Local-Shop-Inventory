// App.tsx - Local Shop Inventory (static + sql.js version)

import { useEffect, useState } from 'react';
import initSqlJs, { Database } from 'sql.js';
import './App.css';

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  category: string;
}

function App() {
  const [db, setDb] = useState<Database | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Initialize SQL.js and in-memory DB
  useEffect(() => {
    const initDb = async () => {
      const SQL = await initSqlJs({ locateFile: file => `https://sql.js.org/dist/${file}` });
      const db = new SQL.Database();
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          quantity INTEGER,
          price REAL,
          category TEXT
        );
      `);
      // Add demo data
      db.run(`INSERT INTO products (name, quantity, price, category) VALUES
        ('Bananas', 5, 1.2, 'Fruit'),
        ('Bread', 3, 2.5, 'Bakery'),
        ('Milk', 2, 1.8, 'Dairy');
      `);
      setDb(db);
      loadProducts(db);
    };
    initDb();
  }, []);

  const loadProducts = (db: Database) => {
    const result = db.exec("SELECT * FROM products;");
    if (result.length > 0) {
      const values = result[0].values as (string | number)[][];
      const items = values.map(
        ([id, name, quantity, price, category]) =>
          ({ id, name, quantity, price, category } as Product)
      );
      setProducts(items);
    } else {
      setProducts([]);
    }
  };

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setQuantity('');
    setPrice('');
    setCategory('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    const product = {
      name: capitalize(name),
      quantity: parseInt(quantity),
      price: parseFloat(price),
      category: capitalize(category),
    };

    if (editingProduct) {
      db.run(
        `UPDATE products SET name = ?, quantity = ?, price = ?, category = ? WHERE id = ?;`,
        [product.name, product.quantity, product.price, product.category, editingProduct.id]
      );
    } else {
      db.run(
        `INSERT INTO products (name, quantity, price, category) VALUES (?, ?, ?, ?);`,
        [product.name, product.quantity, product.price, product.category]
      );
    }

    loadProducts(db);
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (!db) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;
    db.run(`DELETE FROM products WHERE id = ?;`, [id]);
    loadProducts(db);
  };

  const uniqueCategories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="container" style={{ padding: '1rem' }}>
      <h1>🛍️ Local Shop Inventory (Static Demo)</h1>

      <input
        type="text"
        placeholder="Search product..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '1rem', display: 'block' }}
      />

      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        style={{ marginBottom: '1rem', display: 'block' }}
      >
        <option value="">All Categories</option>
        {uniqueCategories.map((cat) => (
          <option key={cat} value={cat}>
            {capitalize(cat)}
          </option>
        ))}
      </select>

      <ul>
        {products
          .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .filter(
            (p) =>
              categoryFilter === '' ||
              p.category.toLowerCase() === categoryFilter.toLowerCase()
          )
          .map((p) => (
            <li key={p.id} className="action-buttons">
              <div className="text-box">
                {p.name} – {p.quantity} in stock – ${p.price.toFixed(2)} – Category: {p.category}
              </div>
              <div className="button-group">
                <button onClick={() => handleDelete(p.id)}>❌ Delete</button>
                <button onClick={() => setEditingProduct(p)}>✏️ Edit</button>
              </div>
            </li>
          ))}
      </ul>

      <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <button type="submit">
          {editingProduct ? 'Update Product' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}

export default App;
