import { test as baseTest } from './base.fixture';
import { UserAPI } from '../api/user.api';
import { ProductAPI } from '../api/product.api';
import { createUser } from '../data/factories/user.factory';
import { createProduct } from '../data/factories/product.factory';

type DbFixtures = {
  seededUser: { id: string; email: string; password: string };
  seededProduct: { id: string; name: string; price: number };
};

export const test = baseTest.extend<DbFixtures>({
  seededUser: async ({ request, baseAPIURL }, use) => {
    const userAPI = new UserAPI(request, baseAPIURL);
    const userData = createUser();
    const user = await userAPI.createUser(userData);
    await use({ id: user.id, email: userData.email, password: userData.password });
    await userAPI.deleteUser(user.id);
  },

  seededProduct: async ({ request, baseAPIURL }, use) => {
    const productAPI = new ProductAPI(request, baseAPIURL);
    const productData = createProduct();
    const { id, ...rest } = productData;
    const product = await productAPI.createProduct(rest);
    await use(product);
    await productAPI.deleteProduct(product.id);
  },
});

export { expect } from '@playwright/test';
