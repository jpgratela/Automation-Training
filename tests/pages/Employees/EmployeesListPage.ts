import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";
import { EmployeeFormPage } from "./EmployeeFormPage";

export class EmployeesListPage extends BasePage {
    readonly newEmployeeButton: Locator;
    readonly rows: Locator;

    constructor(page:Page){
        super(page);
        this.newEmployeeButton = page.getByTestId('new-employee');
        this.rows = page.getByTestId('employee-row');
    }

    async goto(){
        await this.page.goto('/employees');
    }

    row(text: string): Locator {
        return this.rows.filter({ hasText: text});
    }
    
    async clickNew(): Promise<EmployeeFormPage> {
        await this.newEmployeeButton.click();
        return new EmployeeFormPage(this.page)
    }

    async edit(text: string): Promise<EmployeeFormPage> {
        await this.row(text).getByTestId('edit-employee').click();
        return new EmployeeFormPage(this.page);
    }

    async delete(text: string): Promise<void> {
        this.page.once("dialog", (dialog) => dialog.accept());
        await this.row(text).getByTestId('delete-employee').click();
        // return new EmployeeFormPage(this.page);
    }

    async expectVisible(text: string): Promise<void> {
        await expect(this.row(text)).toBeVisible();
    }

    async expectDeleted(text: string): Promise<void> {
        await expect(this.row(text)).toHaveCount(0);
    }
}