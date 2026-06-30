import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { EmployeeFormPage } from './EmployeeFormPage';

export class EmployeesListPage extends BasePage {
  readonly newButton: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.newButton = page.getByTestId('new-employee');
    this.rows = page.getByTestId('employee-row');
  }

  async goto(): Promise<void> {
    await this.page.goto('/employees');
  }

  /** A single table row located by any text it contains (name, email, title). */
  row(text: string): Locator {
    return this.rows.filter({ hasText: text });
  }

  /** Click "New Employee" and return the form page object. */
  async clickNew(): Promise<EmployeeFormPage> {
    await this.newButton.click();
    return new EmployeeFormPage(this.page);
  }

  /** Open the edit form for the row matching `text`. */
  async edit(text: string): Promise<EmployeeFormPage> {
    await this.row(text).getByTestId('edit-employee').click();
    return new EmployeeFormPage(this.page);
  }

  /** Delete the row matching `text`, auto-accepting the confirm dialog. */
  async delete(text: string): Promise<void> {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.row(text).getByTestId('delete-employee').click();
  }

  async expectRowVisible(text: string): Promise<void> {
    await expect(this.row(text)).toBeVisible();
  }

  async expectRowAbsent(text: string): Promise<void> {
    await expect(this.row(text)).toHaveCount(0);
  }
}
