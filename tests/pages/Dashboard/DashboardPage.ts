import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";

export class DashboardPage extends BasePage {
    readonly employeeStat: Locator;
    readonly activeStat: Locator;
    readonly departmentStat: Locator;

    constructor(page: Page) {
        super(page);

        this.employeeStat = this.page.getByTestId('stat-employees');
        this.activeStat = this.page.getByTestId('stat-active');
        this.departmentStat = this.page.getByTestId('stat-departments');
    }

    async goto(){
        await this.page.goto('/dashboard');
    }

    async expectLoaded(){
        await expect(this.employeeStat).toBeVisible();
    }
}