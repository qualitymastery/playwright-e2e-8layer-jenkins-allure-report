import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Checkout', () => {
  test.beforeEach(async ({ authenticatedInventory }) => {
    await authenticatedInventory.addToCartByName('Sauce Labs Backpack');
    await authenticatedInventory.goToCart();
  });

  test('complete checkout flow', async ({ authenticatedInventory }) => {
    const page = authenticatedInventory.page;
    await page.getByTestId('checkout').click();
    await page.getByTestId('firstName').fill('John');
    await page.getByTestId('lastName').fill('Doe');
    await page.getByTestId('postalCode').fill('12345');
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(/checkout-step-two/);
    await page.getByTestId('finish').click();
    await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
  });

  test('missing zip shows error', async ({ authenticatedInventory }) => {
    const page = authenticatedInventory.page;
    await page.getByTestId('checkout').click();
    await page.getByTestId('firstName').fill('John');
    await page.getByTestId('lastName').fill('Doe');
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toContainText('Postal Code is required');
  });

  test('cancel checkout returns to cart', async ({ authenticatedInventory }) => {
    const page = authenticatedInventory.page;
    await page.getByTestId('checkout').click();
    await page.getByTestId('cancel').click();
    await expect(page).toHaveURL(/cart/);
  });
});
