import { Page, Locator } from '@playwright/test';

/**
 * Shared behaviour for every page that renders the authenticated navbar
 * (Dashboard, Employees, Departments, forms). Authenticated page objects
 * extend this so the navigation/logout logic lives in exactly one place.
 */
export class BasePage {
  readonly page: Page;
  readonly navDashboard: Locator;
  readonly navEmployees: Locator;
  readonly navDepartments: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navEmployees = page.getByTestId('nav-employees');
    this.navDepartments = page.getByTestId('nav-departments');
    this.logoutButton = page.getByTestId('logout');
  }

  async gotoDashboard(): Promise<void> {
    await this.navDashboard.click();
  }

  async gotoEmployees(): Promise<void> {
    await this.navEmployees.click();
  }

  async gotoDepartments(): Promise<void> {
    await this.navDepartments.click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
