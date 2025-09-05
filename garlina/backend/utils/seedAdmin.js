import bcrypt from 'bcryptjs';
import { db } from '../db.js';

export async function ensureAdminOnBoot() {
  const users = await db.getUsers();
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@garlina.local';
  const adminPass = process.env.ADMIN_PASSWORD || 'garlina123';
  const exists = users.find(u => u.email.toLowerCase() == adminEmail.toLowerCase());
  if (!exists) {
    const hash = await bcrypt.hash(adminPass, 10);
    users.push({
      id: crypto.randomUUID(),
      name: 'Administrator',
      email: adminEmail,
      passwordHash: hash,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    await db.saveUsers(users);
    console.log(`Seeded admin: ${adminEmail}`);
  }
}
