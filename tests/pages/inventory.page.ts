import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
  private readonly cartBadge = this.page.getByTestId('shopping-cart-badge');
  private readonly cartLink = this.page.getByTestId('shopping-cart-link');
  private readonly sortDropdown = this.page.getByTestId('product-sort-container');
  private readonly menuBtn = this.page.getByRole('button', { name: 'Open Menu' });
  private readonly logoutLink = this.page.getByTestId('logout-sidebar-link');

  async goto(): Promise<void> {
    await this.navigate('/inventory.html');
  }

  items(): Locator {
    return this.page.getByTestId('inventory-item');
  }

  itemByName(name: string): Locator {
    return this.page.getByTestId('inventory-item').filter({ hasText: name });
  }

  async addToCartByName(name: string): Promise<void> {
    const item = this.itemByName(name);
    const btnId = name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    await item.getByTestId(`add-to-cart-${btnId}`).click();
  }

  async removeFromCartByName(name: string): Promise<void> {
    const btnId = name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    await this.page.getByTestId(`remove-${btnId}`).click();
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.items()).toHaveCount(count);
  }

  async expectCartBadge(count: number): Promise<void> {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async expectNoCartBadge(): Promise<void> {
    await expect(this.cartBadge).not.toBeVisible();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async sortBy(option: string): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async logout(): Promise<void> {
    await this.menuBtn.click();
    await this.logoutLink.click();
  }
}
