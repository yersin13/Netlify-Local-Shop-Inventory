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
  const [started, setStarted] = useState(false);
  const [db, setDb] = useState<Database | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [lastSQL, setLastSQL] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const ALLOWED_CATEGORIES = ['Fruit', 'Bakery', 'Dairy'];


  const filteredProducts = products
    .filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p) =>
      selectedCategory === '' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase()
    );

  // Initialize SQL.js and in-memory DB
  //   useEffect(() => {
  //   const initDb = async () => {
  //     const SQL = await initSqlJs({ locateFile: file => `https://sql.js.org/dist/${file}` });

  //     let db;

  //     // Try to load saved DB
  //     const saved = localStorage.getItem('mydb');
  //     if (saved) {
  //       const uIntArray = new Uint8Array(JSON.parse(saved));
  //       db = new SQL.Database(uIntArray);
  //     } else {
  //    db = new SQL.Database();

  // const createSQL = `
  // CREATE TABLE IF NOT EXISTS products (
  //   id INTEGER PRIMARY KEY AUTOINCREMENT,
  //   name TEXT,
  //   quantity INTEGER,
  //   price REAL,
  //   category TEXT
  // );`;

  // const insertSQL = `
  // INSERT INTO products (name, quantity, price, category) VALUES
  //   ('Bananas', 5, 1.2, 'Fruit'),
  //   ('Bread', 3, 2.5, 'Bakery'),
  //   ('Milk', 2, 1.8, 'Dairy');`;

  // db.run(createSQL);
  // db.run(insertSQL);

  // // ✅ Show in SQL Executed Box
  // setLastSQL(createSQL + '\n' + insertSQL);


  //     }

  //     setDb(db);
  //     loadProducts(db);
  //   };

  //   initDb();
  // }, []);

  useEffect(() => {
    const alreadyStarted = localStorage.getItem('demoStarted') === 'true';
    if (alreadyStarted) {
      setStarted(true);
      initializeDemo();
    }
  }, []);

  // Cancel edit mode if filters are applied or changed
  useEffect(() => {
    setEditingProduct(null);
    resetForm(); // ✅ Clears the form
    setLastSQL("");
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setQuantity(editingProduct.quantity.toString());
      setPrice(editingProduct.price.toString());
      setCategory(editingProduct.category);
    }
  }, [editingProduct]);


  const initializeDemo = async () => {
    const SQL = await initSqlJs({ locateFile: file => `https://sql.js.org/dist/${file}` });
    let db = new SQL.Database();

    const createSQL = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  quantity INTEGER,
  price REAL,
  category TEXT
);`;

    const insertSQL = `
INSERT INTO products (name, quantity, price, category) VALUES
   ('Bananas', 5, 1.2, 'Fruit'),
  ('Bread', 3, 2.5, 'Bakery'),
  ('Milk', 2, 1.8, 'Dairy'),
  ('Apples', 10, 1.5, 'Fruit'),
  ('Cheese', 4, 3.2, 'Dairy'),
  ('Croissant', 6, 2.8, 'Bakery');`;

    db.run(createSQL);
    db.run(insertSQL);

    setDb(db);
    loadProducts(db, true);
    saveDbToLocalStorage(db);
    setLastSQL(createSQL + '\n' + insertSQL);
    localStorage.setItem('demoStarted', 'true');
  };


  const saveDbToLocalStorage = (db: Database) => {
    const binaryArray = db.export();
    localStorage.setItem('mydb', JSON.stringify(Array.from(binaryArray)));
  };


  const loadProducts = (db: Database, suppressSQL: boolean = false) => {
    const sql = "SELECT * FROM products;";
    const result = db.exec(sql);

    if (!suppressSQL) {
      setLastSQL(sql);
    }

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

    if (!ALLOWED_CATEGORIES.includes(product.category)) {
      alert("Invalid category selected. Please choose a valid category.");
      return;
    }
    if (editingProduct) {
      const sql = `UPDATE products SET name = ?, quantity = ?, price = ?, category = ? WHERE id = ?;`;
      db.run(sql, [product.name, product.quantity, product.price, product.category, editingProduct.id]);
      setLastSQL(
        `UPDATE products SET name = '${product.name}', quantity = ${product.quantity}, price = ${product.price}, category = '${product.category}' WHERE id = ${editingProduct.id};`
      );
      setEditingProduct(null); // ✅ Exit edit mode after updating
    } else {
      const sql = `INSERT INTO products (name, quantity, price, category) VALUES (?, ?, ?, ?);`;
      db.run(sql, [product.name, product.quantity, product.price, product.category]);
      setLastSQL(
        `INSERT INTO products (name, quantity, price, category) VALUES ('${product.name}', ${product.quantity}, ${product.price}, '${product.category}');`
      );
    }
    saveDbToLocalStorage(db); // ✅ Save AFTER the DB change

    resetForm();
    loadProducts(db, true);
  };


  const handleDelete = (id: number) => {
    if (!db) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    const sql = `DELETE FROM products WHERE id = ?;`;
    db.run(sql, [id]);

    setLastSQL(`DELETE FROM products WHERE id = ${id};`);

    saveDbToLocalStorage(db); // ✅ Save AFTER the DELETE

    loadProducts(db, true);
  };




  const uniqueCategories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <>
      {!started ? (
        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
          <h2>🛠 Start SQL Inventory Demo</h2>
          <p>This demo uses an in-memory SQL database. Click below to create the table and insert initial data.</p>
          <button
            onClick={() => {
              setStarted(true);
              initializeDemo();
            }}
            style={{
              fontSize: '1.2rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ▶️ Start Demo
          </button>
        </div>
      ) : (
        <div className="container" style={{ padding: '1rem' }}>
          <h1>🛍️ Local Shop Inventory (Static Demo)</h1>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
              style={{ marginBottom: '1rem', display: 'block' }}
            />
            <div className="select-wrapper">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {capitalize(cat)}
                  </option>
                ))}
              </select>
            </div>

            {(selectedCategory || searchTerm) && (
              <button
                style={{ margin: '1rem 0', padding: '0.5rem 1rem' }}
                onClick={() => {
                  setSelectedCategory('');
                  setSearchTerm('');
                  setEditingProduct(null);
                }}
                className="reset-button"
              >
                🔄 Reset Filters
              </button>
            )}
          </div>


          <ul>
            {filteredProducts.length === 0 ? (
              <p style={{ color: '#ccc' }}>No products found.</p>
            ) : (
              filteredProducts.map((p) => (
                <li
                  key={p.id}
                  className="action-buttons"
                  style={{
                    backgroundColor: editingProduct?.id === p.id ? '#446688' : '#232231',
                    border: editingProduct?.id === p.id ? '2px solid #00ff90' : 'none',
                  }}
                >
                  <div className="text-box">
                    {p.name} – {p.quantity} in stock – ${p.price.toFixed(2)} – Category: {p.category}
                  </div>
                  <div className="button-group">
                    <button onClick={() => handleDelete(p.id)}>❌ Delete</button>
                    <button
                      onClick={() => {
                        if (editingProduct?.id === p.id) {
                          // Cancel editing
                          setEditingProduct(null);
                          setLastSQL("🔹 Editing cancelled — SQL visible again.");
                        } else {
                          // Start editing
                          setEditingProduct(p);
                          setLastSQL("🔹 Editing mode started — SQL hidden until update or cancel.");
                        }
                      }}
                    >
                      {editingProduct?.id === p.id ? '❌ Cancel Edit' : '✏️ Edit'}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

          <h2 style={{ color: editingProduct ? '#00aaff' : 'inherit' }}>
            {editingProduct ? '✏️ Editing Product' : '➕ Add New Product'}
          </h2>


          {(lastSQL || selectedCategory || searchTerm) && (
            <div className="sql-box"
              style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: '#111',
                fontFamily: 'monospace',
                borderRadius: '8px',
                border: '1px solid #333',
                color: '#fff',
                fontSize: '0.9rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {/* Always show SQL command if any (INSERT, DELETE, etc.) */}
              {lastSQL && (
                <>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#00ff90' }}>
                    🛠 Last CRUD SQL Executed:
                  </strong>
                  {lastSQL}
                  <br />
                  <br />
                </>
              )}

              {/* Always show filtered SQL if filters are active */}
              {(selectedCategory || searchTerm) && (
                <>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#00ff90' }}>
                    🧩 Only Filtered and sorted SQL:
                  </strong>
                  {`SELECT * FROM products` +
                    (selectedCategory ? ` WHERE category = '${capitalize(selectedCategory)}'` : '') +
                    (searchTerm
                      ? `${selectedCategory ? ' AND' : ' WHERE'} name LIKE '%${searchTerm}%'`
                      : '') +
                    ';'}
                </>
              )}
            </div>
          )}



          <br />

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

            <div className="select-wrapper">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required

              >
                <option value="">Select Category</option>
                {ALLOWED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </form>

          <button
            style={{ marginTop: '1rem', backgroundColor: '#f44336', color: '#fff' }}
            onClick={() => {
              if (confirm("Reset all data?")) {
                if (!db) return;

                db.run(`DROP TABLE IF EXISTS products;`);
                localStorage.removeItem('mydb');
                localStorage.removeItem('demoStarted'); // 👈 Reset flag

                setStarted(false);
                setDb(null);
                setProducts([]);
                setLastSQL('');
                resetForm();
                setSearchTerm('');
                setSelectedCategory('');
              }
            }}

          >
            🔁 Reset Database
          </button>
        </div>
      )}
    </>
  );

}

export default App;
