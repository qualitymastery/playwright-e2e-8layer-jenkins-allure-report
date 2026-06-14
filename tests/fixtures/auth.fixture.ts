import { test as baseTest } from './base.fixture';
import { InventoryPage } from '../pages/inventory.page';

type AuthFixtures = {
  authenticatedInventory: InventoryPage;
};

export const test = baseTest.extend<AuthFixtures>({
  authenticatedInventory: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await use(inventory);
    await context.close();
  },
});

export { expect } from '@playwright/test';
