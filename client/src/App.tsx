// App.tsx - Local Shop Inventory System

import { useEffect, useState } from 'react';
import './App.css';

// Type definition for a product
interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  category: string;
}

function App() {
  // Local state for product form fields
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  // State for searching/filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Load saved form values from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('name');
    const savedQuantity = localStorage.getItem('quantity');
    const savedPrice = localStorage.getItem('price');
    const savedCategory = localStorage.getItem('category');

    if (savedName) setName(savedName);
    if (savedQuantity) setQuantity(savedQuantity);
    if (savedPrice) setPrice(savedPrice);
    if (savedCategory) setCategory(savedCategory);
  }, []);

  // Load product list from server on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('http://localhost:3001/products');
    const data = await res.json();
    setProducts(data);
  };

  // Autofill form when editing
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setQuantity(editingProduct.quantity.toString());
      setPrice(editingProduct.price.toString());
      setCategory(editingProduct.category);
    }
  }, [editingProduct]);

  const startEditing = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedProduct = {
      name: capitalize(name),
      quantity: parseInt(quantity),
      price: parseFloat(price),
      category: capitalize(category),
    };

    const res = await fetch(`http://localhost:3001/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    });

    if (res.ok) {
      resetForm();
      fetchProducts();
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct = {
      name: capitalize(name),
      quantity: parseInt(quantity),
      price: parseFloat(price),
      category: capitalize(category),
    };

    const res = await fetch('http://localhost:3001/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    });

    if (res.ok) {
      resetForm();
      fetchProducts();
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    const res = await fetch(`http://localhost:3001/products/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) fetchProducts();
  };

  // Reset form fields and localStorage
  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setQuantity('');
    setPrice('');
    setCategory('');
    localStorage.clear();
  };

  // Helper function to capitalize input
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  // Unique category list for the filter dropdown
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="container" style={{ padding: '1rem' }}>
      <h1>🛍️ Local Shop Inventory</h1>

      {/* Search and filter */}
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

      {/* Product list */}
      <ul>
        {products
          .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .filter((p) =>
            categoryFilter === '' || p.category.toLowerCase() === categoryFilter.toLowerCase()
          )
          .map((p) => (
            <li key={p.id} className="action-buttons">
              <div className="text-box">
                {p.name} – {p.quantity} in stock – ${p.price.toFixed(2)} – Category: {p.category}
              </div>
              <div className="button-group">
                <button onClick={() => handleDelete(p.id)}>❌ Delete</button>
                <button onClick={() => startEditing(p)}>✏️ Edit</button>
              </div>
            </li>
          ))}
      </ul>

      {/* Form to add or update a product */}
      <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            localStorage.setItem('name', e.target.value);
          }}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            localStorage.setItem('quantity', e.target.value);
          }}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            localStorage.setItem('price', e.target.value);
          }}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            localStorage.setItem('category', e.target.value);
          }}
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
