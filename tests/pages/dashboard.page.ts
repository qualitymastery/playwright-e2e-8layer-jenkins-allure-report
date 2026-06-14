import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { NavComponent } from '../components/nav.component';
import { DataTableComponent } from '../components/data-table.component';
import { ModalComponent } from '../components/modal.component';

export class DashboardPage extends BasePage {
  readonly nav: NavComponent;
  readonly usersTable: DataTableComponent;
  readonly deleteModal: ModalComponent;

  constructor(page: Page) {
    super(page);
    this.nav = new NavComponent(page);
    this.usersTable = new DataTableComponent(page.locator('[data-testid="users-table"]'));
    this.deleteModal = new ModalComponent(page.getByRole('dialog'));
  }

  async goto(): Promise<void> {
    await this.navigate('/dashboard');
  }

  async expectWelcome(name: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: `Welcome, ${name}` })).toBeVisible();
  }

  async deleteUser(row: number): Promise<void> {
    await this.usersTable.clickAction(row, 'Delete');
    await this.deleteModal.confirm();
  }
}
