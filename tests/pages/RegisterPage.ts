import { Locator, Page, expect } from "@playwright/test";

export class RegisterPage {
    readonly page: Page;
    readonly fullnameInput: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorAlert: Locator;
    readonly loginLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.fullnameInput = page.getByTestId('fullName');
        this.usernameInput = page.getByTestId('username');
        this.passwordInput = page.getByTestId('password');
        this.submitButton = page.getByTestId('register-submit');
        this.errorAlert = page.getByTestId('register-error');
        this.loginLink = page.getByTestId('go-login');
    }

    async goto(){
        await this.page.goto('/register');
    }

    async register(fullname: string, username: string, password: string){
        await this.fullnameInput.fill(fullname);
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    async logIn(){
        await this.loginLink.click();
    }

    async expectError(text: string | RegExp) {
        await expect(this.errorAlert).toContainText(text);
    }
}