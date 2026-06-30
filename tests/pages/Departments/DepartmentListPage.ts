import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";

export class DepartmentListPage extends BasePage {
    readonly newDepartment : Locator;
    readonly rows : Locator;

    constructor(page: Page){
        super(page);
        this.newDepartment = page.getByTestId('new-department');
        this.rows = page.getByTestId('department-row');
    }

    async goto(){
        await this.page.goto('/departments');
    }
}