import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  async goto(): Promise<void> {
    await this.navigate('/checkout-step-one.html');
  }

  async fillInfo(firstName: string, lastName: string, zip: string): Promise<void> {
    await this.page.getByTestId('firstName').fill(firstName);
    await this.page.getByTestId('lastName').fill(lastName);
    await this.page.getByTestId('postalCode').fill(zip);
    await this.page.getByTestId('continue').click();
  }

  async finish(): Promise<void> {
    await this.page.getByTestId('finish').click();
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
  }

  async expectItemTotal(total: string): Promise<void> {
    await expect(this.page.getByTestId('subtotal-label')).toContainText(total);
  }
}
