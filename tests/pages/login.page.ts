import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.getByTestId('username');
  private readonly passwordInput = this.page.getByTestId('password');
  private readonly submitBtn = this.page.getByTestId('login-button');
  private readonly errorAlert = this.page.getByTestId('error');

  async goto(): Promise<void> {
    await this.navigate('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(message);
  }

  async expectLoginPage(): Promise<void> {
    await expect(this.submitBtn).toBeVisible();
  }
}
