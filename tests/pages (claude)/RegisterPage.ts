import { Page, Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.getByTestId('fullName');
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('register-submit');
    this.errorAlert = page.getByTestId('register-error');
    this.loginLink = page.getByTestId('go-login');
  }

  async goto(): Promise<void> {
    await this.page.goto('/register');
  }

  async register(fullName: string, username: string, password: string): Promise<void> {
    await this.fullNameInput.fill(fullName);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(text: string | RegExp): Promise<void> {
    await expect(this.errorAlert).toContainText(text);
  }
}
