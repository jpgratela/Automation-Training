import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('login-submit');
    this.errorAlert = page.getByTestId('login-error');
    this.registerLink = page.getByTestId('go-register');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  /** Fill the form and submit. Does not assert the outcome. */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Convenience: go to the page, log in, and assert we reached the dashboard. */
  async loginAs(username: string, password: string): Promise<void> {
    await this.goto();
    await this.login(username, password);
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async expectError(text: string | RegExp): Promise<void> {
    await expect(this.errorAlert).toContainText(text);
  }
}
