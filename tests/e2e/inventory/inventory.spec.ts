import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Inventory', () => {
  test('shows 6 products', async ({ authenticatedInventory }) => {
    await authenticatedInventory.expectItemCount(6);
  });

  test('add item increases cart badge', async ({ authenticatedInventory }) => {
    await authenticatedInventory.addToCartByName('Sauce Labs Backpack');
    await authenticatedInventory.expectCartBadge(1);
  });

  test('add two items shows badge count 2', async ({ authenticatedInventory }) => {
    await authenticatedInventory.addToCartByName('Sauce Labs Backpack');
    await authenticatedInventory.addToCartByName('Sauce Labs Bike Light');
    await authenticatedInventory.expectCartBadge(2);
  });

  test('remove item clears badge', async ({ authenticatedInventory }) => {
    await authenticatedInventory.addToCartByName('Sauce Labs Backpack');
    await authenticatedInventory.removeFromCartByName('Sauce Labs Backpack');
    await authenticatedInventory.expectNoCartBadge();
  });

  test('sort by price low to high', async ({ authenticatedInventory }) => {
    await authenticatedInventory.sortBy('lohi');
    const prices = authenticatedInventory.page.locator('[data-test="inventory-item-price"]');
    const first = await prices.first().textContent();
    const last = await prices.last().textContent();
    expect(parseFloat(first!.replace('$', ''))).toBeLessThan(parseFloat(last!.replace('$', '')));
  });

  test('logout returns to login page', async ({ authenticatedInventory }) => {
    await authenticatedInventory.logout();
    await expect(authenticatedInventory.page).toHaveURL('/');
    await expect(authenticatedInventory.page.getByTestId('login-button')).toBeVisible();
  });
});
