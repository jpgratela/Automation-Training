import { Locator, Page } from "@playwright/test";
import { BasePage } from "../BasePage";
import { EmployeesListPage } from "./EmployeesListPage";

export interface EmployeeFormData {
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
    department?: string; // selected by visible label
    jobTitle?: string;
    hireDate?: string; // YYYY-MM-DD
    salary?: string | number;
    status?: 'active' | 'inactive';
}

export class EmployeeFormPage extends BasePage{
    readonly firstName : Locator;
    readonly lastName : Locator;
    readonly emailAddress : Locator;
    readonly department : Locator;
    readonly jobTitle : Locator;
    readonly hireDate : Locator;
    readonly salary : Locator;
    readonly status : Locator;
    readonly saveButton : Locator;
    // readonly cancelButton : Locator;

    constructor(page:Page){
        super(page);
        this.firstName = page.getByTestId('first_name');
        this.lastName = page.getByTestId('last_name');
        this.emailAddress = page.getByTestId('email');
        this.department = page.getByTestId('department_id');
        this.jobTitle = page.getByTestId('job_title');
        this.hireDate = page.getByTestId('hire_date');
        this.salary = page.getByTestId('salary');
        this.status = page.getByTestId('status');
        this.saveButton = page.getByTestId('save-employee');
    }

    async fillData(data:EmployeeFormData): Promise<void>{
        if(data.firstName !== undefined) await this.firstName.fill(data.firstName);
        if(data.lastName !== undefined) await this.lastName.fill(data.lastName);
        if(data.emailAddress !== undefined) await this.emailAddress.fill(data.emailAddress);
        if(data.department !== undefined) await this.department.selectOption(data.department);
        if(data.jobTitle !== undefined) await this.jobTitle.fill(data.jobTitle);
        if(data.hireDate !== undefined) await this.hireDate.fill(data.hireDate);
        if(data.salary !== undefined) await this.salary.fill(String(data.salary));
        if(data.status !== undefined) await this.status.fill(data.status);
    }

    async save(): Promise<EmployeesListPage>{
        await this.saveButton.click();
        return new EmployeesListPage(this.page);
    }
}