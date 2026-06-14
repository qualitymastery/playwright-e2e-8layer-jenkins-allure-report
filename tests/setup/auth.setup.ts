import { test as setup, expect } from '@playwright/test';

setup('authenticate user', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill(process.env.TEST_USER_EMAIL || 'standard_user');
  await page.getByTestId('password').fill(process.env.TEST_USER_PASSWORD || 'secret_sauce');
  await page.getByTestId('login-button').click();
  await expect(page).toHaveURL(/inventory/);
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
