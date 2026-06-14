import { Page, expect } from '@playwright/test';
import { BaseComponent } from './base.component';

export class NavComponent extends BaseComponent {
  constructor(page: Page) {
    super(page.getByRole('navigation'));
  }

  async goTo(label: string): Promise<void> {
    await this.root.getByRole('link', { name: label }).click();
  }

  async expectActive(label: string): Promise<void> {
    await expect(this.root.getByRole('link', { name: label })).toHaveClass(/active/);
  }

  async expectLinkVisible(label: string): Promise<void> {
    await expect(this.root.getByRole('link', { name: label })).toBeVisible();
  }
}
