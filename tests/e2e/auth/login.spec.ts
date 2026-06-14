import { test, expect } from '../../fixtures/base.fixture';

test.describe('Login', () => {
  test('valid credentials redirects to inventory', async ({ loginPage, page }) => {
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory/);
  });

  test('locked user shows error', async ({ loginPage }) => {
    await loginPage.login('locked_out_user', 'secret_sauce');
    await loginPage.expectError('Sorry, this user has been locked out');
  });

  test('wrong password shows error', async ({ loginPage }) => {
    await loginPage.login('standard_user', 'wrong_password');
    await loginPage.expectError('Username and password do not match');
  });

  test('empty credentials shows error', async ({ loginPage }) => {
    await loginPage.login('', '');
    await loginPage.expectError('Username is required');
  });
});
