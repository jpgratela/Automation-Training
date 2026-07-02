import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";
import { EmployeeFormPage } from "./EmployeeFormPage";

export class EmployeesListPage extends BasePage {
    readonly newEmployeeButton: Locator;
    readonly rows: Locator;
    readonly searchNameInput: Locator;
    readonly searchDepartmentInput: Locator;
    readonly searchJobTitleInput: Locator;
    readonly searchActiveRadio: Locator;
    readonly searchInactiveRadio: Locator;
    readonly searchAllRadio: Locator;
    readonly searchButton: Locator;

    constructor(page:Page){
        super(page);
        this.newEmployeeButton = page.getByTestId('new-employee');
        this.rows = page.getByTestId('employee-row');
        this.searchNameInput = page.getByTestId('search-name');
        this.searchDepartmentInput = page.getByTestId('search-department');
        this.searchJobTitleInput = page.getByTestId('search-job-title');
        this.searchActiveRadio = page.getByTestId('status-active');
        this.searchInactiveRadio = page.getByTestId('status-inactive');
        this.searchAllRadio = page.getByTestId('status-all');
        this.searchButton = page.getByTestId('search-submit');
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

    private statusRadio(status: 'active' | 'inactive' | 'all'): Locator {
        switch (status) {
            case 'active': return this.searchActiveRadio;
            case 'inactive': return this.searchInactiveRadio;
            case 'all': return this.searchAllRadio;
        }
    }

    async searchEmployee(filters: Partial<{
        name: string;
        department: string;
        jobTitle: string;
        status: 'active' | 'inactive' | 'all';
    }>): Promise<void> {
        if (filters.name !== undefined) await this.searchNameInput.fill(filters.name);
        if (filters.department !== undefined) await this.searchDepartmentInput.fill(filters.department);
        if (filters.jobTitle !== undefined) await this.searchJobTitleInput.fill(filters.jobTitle);
        // btn-check radios are CSS-hidden; force skips visibility check, checked state still verified
        if (filters.status !== undefined) await this.statusRadio(filters.status).check({ force: true });
        await this.searchButton.click();
    }
}
