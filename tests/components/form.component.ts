import { Locator, expect } from '@playwright/test';
import { BaseComponent } from './base.component';

export class FormComponent extends BaseComponent {
  constructor(root: Locator) {
    super(root);
  }

  async fill(label: string, value: string): Promise<void> {
    await this.root.getByLabel(label).fill(value);
  }

  async select(label: string, value: string): Promise<void> {
    await this.root.getByLabel(label).selectOption(value);
  }

  async check(label: string): Promise<void> {
    await this.root.getByLabel(label).check();
  }

  async submit(buttonName = 'Submit'): Promise<void> {
    await this.root.getByRole('button', { name: buttonName }).click();
  }

  async expectError(field: string, message: string): Promise<void> {
    await expect(this.root.getByText(message)).toBeVisible();
  }
}
