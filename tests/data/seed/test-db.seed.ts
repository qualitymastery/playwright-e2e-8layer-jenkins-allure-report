import { createUser, createAdminUser } from '../factories/user.factory';
import { createProduct } from '../factories/product.factory';

export const seedUsers = {
  admin: createAdminUser({ email: 'admin@example.com', password: 'AdminPass1!' }),
  standard: createUser({ email: 'user@example.com', password: 'UserPass1!' }),
};

export const seedProducts = Array.from({ length: 5 }, (_, i) =>
  createProduct({ name: `Seed Product ${i + 1}`, price: (i + 1) * 10 })
);
