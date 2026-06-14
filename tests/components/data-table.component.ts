import { Locator, expect } from '@playwright/test';
import { BaseComponent } from './base.component';

export class DataTableComponent extends BaseComponent {
  constructor(root: Locator) {
    super(root);
  }

  row(index: number): Locator {
    return this.root.getByRole('row').nth(index + 1); // skip header
  }

  cell(row: number, col: number): Locator {
    return this.row(row).getByRole('cell').nth(col);
  }

  async expectRowCount(count: number): Promise<void> {
    const rows = this.root.getByRole('row');
    await expect(rows).toHaveCount(count + 1); // +1 for header
  }

  async expectCellText(row: number, col: number, text: string): Promise<void> {
    await expect(this.cell(row, col)).toHaveText(text);
  }

  async clickAction(row: number, action: string): Promise<void> {
    await this.row(row).getByRole('button', { name: action }).click();
  }

  async sortBy(column: string): Promise<void> {
    await this.root.getByRole('columnheader', { name: column }).click();
  }
}
