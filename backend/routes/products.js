const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');

const DB_PATH = path.join(__dirname, '../data/db.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product-${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// GET all products (public)
router.get('/', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.products });
});

// GET single product (public)
router.get('/:id', (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

// POST create product (protected)
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  const db = readDB();
  const { name, price, category, weight, description, badge, stock } = req.body;

  if (!name || !price) return res.status(400).json({ success: false, message: 'Name and price are required' });

  const newProduct = {
    id: uuidv4(),
    name,
    price: parseFloat(price),
    category: category || 'Pure',
    weight: weight || '500g',
    description: description || '',
    image: req.file ? `/uploads/${req.file.filename}` : '/uploads/default.jpg',
    badge: badge || '',
    stock: parseInt(stock) || 0
  };

  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json({ success: true, data: newProduct });
});

// PUT update product (protected)
router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  const { name, price, category, weight, description, badge, stock } = req.body;
  const existing = db.products[index];

  db.products[index] = {
    ...existing,
    name: name || existing.name,
    price: price ? parseFloat(price) : existing.price,
    category: category || existing.category,
    weight: weight || existing.weight,
    description: description !== undefined ? description : existing.description,
    badge: badge !== undefined ? badge : existing.badge,
    stock: stock !== undefined ? parseInt(stock) : existing.stock,
    image: req.file ? `/uploads/${req.file.filename}` : existing.image
  };

  writeDB(db);
  res.json({ success: true, data: db.products[index] });
});

// DELETE product (protected)
router.delete('/:id', authMiddleware, (req, res) => {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  db.products.splice(index, 1);
  writeDB(db);
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = router;
