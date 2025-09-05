import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');

async function readJSON(file) {
  const p = path.join(dataDir, file);
  try {
    const raw = await fs.readFile(p, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function writeJSON(file, data) {
  const p = path.join(dataDir, file);
  const tmp = p + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmp, p);
}

export const db = {
  async getUsers() { return readJSON('users.json'); },
  async saveUsers(users) { return writeJSON('users.json', users); },

  async getProducts() { return readJSON('products.json'); },
  async saveProducts(products) { return writeJSON('products.json', products); },

  async getOrders() { return readJSON('orders.json'); },
  async saveOrders(orders) { return writeJSON('orders.json', orders); },
};
