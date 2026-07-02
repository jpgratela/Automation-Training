import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";
import { DepartmentFormPage } from "./DepartmentFormPage";

export class DepartmentListPage extends BasePage {
    readonly newDepartmentButton : Locator;
    readonly rows : Locator;
    readonly searchNameInput : Locator;
    readonly searchButton : Locator;

    constructor(page: Page){
        super(page);
        this.newDepartmentButton = page.getByTestId('new-department');
        this.rows = page.getByTestId('department-row');
        this.searchNameInput = page.getByTestId('search-name');
        this.searchButton = page.getByTestId('search-submit');
    }

    async goto(){
        await this.page.goto('/departments');
    }
    
    row(text: string): Locator {
        return this.rows.filter({ hasText: text});
    }

    async clickNew(): Promise<DepartmentFormPage> {
        await this.newDepartmentButton.click();
        return new DepartmentFormPage(this.page)
    }

    async edit(text: string): Promise<DepartmentFormPage> {
        await this.row(text).getByTestId('edit-department').click();
        return new DepartmentFormPage(this.page);
    }

    async delete(text: string): Promise<void> {
        this.page.once("dialog", (dialog) => dialog.accept());
        await this.row(text).getByTestId('delete-department').click();
        // return new DepartmentFormPage(this.page);
    }

    async expectVisible(text: string): Promise<void> {
        await expect(this.row(text)).toBeVisible();
    }

    async expectDeleted(text: string): Promise<void> {
        await expect(this.row(text)).toHaveCount(0);
    }

    async searchDepartment(data: string): Promise<void> {
        await this.searchNameInput.fill(data);
    }
}