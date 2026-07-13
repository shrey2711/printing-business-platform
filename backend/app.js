import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

import { listProducts, getProduct, categories, navGroups } from './data/products.js';
import { computePrice } from './data/pricing.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Memory storage keeps this stateless so it works on Vercel serverless.
const upload = multer({ storage: multer.memoryStorage() });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Printing API is running' });
});

// Catalog ------------------------------------------------------------------
app.get('/api/categories', (req, res) => {
  res.json({ categories, navGroups });
});

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  let items = listProducts();
  if (category) items = items.filter((p) => p.category === category);
  res.json({ products: items });
});

app.get('/api/products/:slug', (req, res) => {
  const product = getProduct(req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

// Instant pricing ----------------------------------------------------------
app.post('/api/price', (req, res) => {
  const result = computePrice(req.body || {});
  if (!result.ok) return res.status(400).json(result);
  res.json(result);
});

// Guest quote request (authenticated orders go through Supabase directly).
app.post('/api/quote', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    message: 'Quote request received',
    reference: `Q-${Date.now().toString().slice(-6)}`,
    data: {
      name: req.body.name,
      email: req.body.email,
      product: req.body.product,
      quantity: req.body.quantity,
      file: req.file ? req.file.originalname : null
    }
  });
});

export default app;
