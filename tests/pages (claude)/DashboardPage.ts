import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly employeeStat: Locator;
  readonly activeStat: Locator;
  readonly departmentStat: Locator;

  constructor(page: Page) {
    super(page);
    this.employeeStat = page.getByTestId('stat-employees');
    this.activeStat = page.getByTestId('stat-active');
    this.departmentStat = page.getByTestId('stat-departments');
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.employeeStat).toBeVisible();
  }

  /** Read a stat card as a number, e.g. to assert counts changed. */
  async employeeCount(): Promise<number> {
    return Number((await this.employeeStat.textContent())?.trim());
  }
}
