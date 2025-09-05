import express from 'express';
import { db } from '../db.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const items = await db.getProducts();
  res.json(items);
});

router.get('/:id', async (req, res) => {
  const items = await db.getProducts();
  const found = items.find(p => p.id === req.params.id);
  if (!found) return res.status(404).json({ message: 'Not found' });
  res.json(found);
});

router.post('/', authRequired, adminOnly, async (req, res) => {
  const { name, description, price, category, sizes, colors, imageUrl } = req.body || {};
  if (!name || price == null) return res.status(400).json({ message: 'Name and price are required' });
  const items = await db.getProducts();
  const product = {
    id: crypto.randomUUID(),
    name,
    description: description || '',
    price: Number(price),
    category: category || 'Dress',
    sizes: Array.isArray(sizes) ? sizes : ["S","M","L"],
    colors: Array.isArray(colors) ? colors : ["Pink","White","Black"],
    imageUrl: imageUrl || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  items.push(product);
  await db.saveProducts(items);
  res.status(201).json(product);
});

router.put('/:id', authRequired, adminOnly, async (req, res) => {
  const items = await db.getProducts();
  const idx = items.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });

  const prev = items[idx];
  const next = { ...prev, ...req.body, updatedAt: new Date().toISOString() };
  items[idx] = next;
  await db.saveProducts(items);
  res.json(next);
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  const items = await db.getProducts();
  const idx = items.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  const [removed] = items.splice(idx, 1);
  await db.saveProducts(items);
  res.json({ ok: true, removed });
});

export default router;
