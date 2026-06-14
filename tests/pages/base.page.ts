import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(readonly page: Page) {}

  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async screenshot(name: string): Promise<void> {
    const fs = await import('fs');
    fs.mkdirSync('screenshots', { recursive: true });
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}
