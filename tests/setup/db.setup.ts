import { test as setup } from '@playwright/test';
import { seedUsers, seedProducts } from '../data/seed/test-db.seed';

setup('seed database', async ({ request }) => {
  const baseURL = process.env.API_URL || 'https://www.saucedemo.com';

  for (const user of Object.values(seedUsers)) {
    try {
      await request.post(`${baseURL}/api/users/seed`, { data: user });
    } catch {
      // seed endpoint not available for this environment — skipping
    }
  }

  for (const product of seedProducts) {
    try {
      await request.post(`${baseURL}/api/products/seed`, { data: product });
    } catch {
      // seed endpoint not available for this environment — skipping
    }
  }
});
