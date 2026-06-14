import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CheckoutPage } from '../pages/checkout.page';

export type TestOptions = {
  baseAPIURL: string;
};

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<TestOptions & Fixtures>({
  baseAPIURL: [process.env.API_URL || 'https://www.saucedemo.com', { option: true }],

  loginPage: async ({ page }, use) => {
    const lp = new LoginPage(page);
    await lp.goto();
    await use(lp);
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect } from '@playwright/test';
