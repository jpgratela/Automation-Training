import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly registerLink: Locator;
    readonly errorAlert: Locator;

    constructor(page: Page){
        this.page = page;
        this.usernameInput = page.getByTestId('username');
        this.passwordInput = page.getByTestId('password');
        this.submitButton = page.getByTestId('login-submit');
        this.registerLink = page.getByTestId('go-register');
        this.errorAlert = page.getByTestId('login-error');
    }

    async goto(){
        await this.page.goto('/login');
    }

    /** Fill the form and submit. Does not assert the outcome. */
    async login(username: string, password: string){
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    async loginAs(username: string, password: string){
        await this.goto();
        await this.login(username, password);
        await expect(this.page).toHaveURL(/\/dashboard/);
    }

    async expectError(text: string | RegExp){
        await expect(this.errorAlert).toContainText(text);
    }
}