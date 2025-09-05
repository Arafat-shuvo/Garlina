import express from 'express';
import { db } from '../db.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { items, customer, note } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }
  const total = items.reduce((sum, it) => sum + Number(it.price) * Number(it.qty || 1), 0);

  const orders = await db.getOrders();
  const order = {
    id: crypto.randomUUID(),
    items,
    customer: {
      name: customer?.name || 'Guest',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || ''
    },
    note: note || '',
    total,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  await db.saveOrders(orders);
  res.status(201).json(order);
});

router.get('/', authRequired, adminOnly, async (req, res) => {
  const orders = await db.getOrders();
  res.json(orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.put('/:id/status', authRequired, adminOnly, async (req, res) => {
  const { status } = req.body || {};
  const orders = await db.getOrders();
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  orders[idx].status = status || orders[idx].status;
  await db.saveOrders(orders);
  res.json(orders[idx]);
});

export default router;
