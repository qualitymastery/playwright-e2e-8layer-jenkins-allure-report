import { Locator, expect } from '@playwright/test';
import { BaseComponent } from './base.component';

export class ModalComponent extends BaseComponent {
  private readonly title: Locator;
  private readonly confirmBtn: Locator;
  private readonly cancelBtn: Locator;
  private readonly closeBtn: Locator;

  constructor(root: Locator) {
    super(root);
    this.title = root.getByRole('heading');
    this.confirmBtn = root.getByRole('button', { name: /confirm|yes|ok/i });
    this.cancelBtn = root.getByRole('button', { name: /cancel|no/i });
    this.closeBtn = root.getByRole('button', { name: 'Close' });
  }

  async confirm(): Promise<void> {
    await this.confirmBtn.click();
    await this.waitForHidden();
  }

  async cancel(): Promise<void> {
    await this.cancelBtn.click();
    await this.waitForHidden();
  }

  async close(): Promise<void> {
    await this.closeBtn.click();
    await this.waitForHidden();
  }

  async expectTitle(text: string): Promise<void> {
    await expect(this.title).toHaveText(text);
  }
}
