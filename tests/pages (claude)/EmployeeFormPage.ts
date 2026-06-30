import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { EmployeesListPage } from './EmployeesListPage';

/** All fields are optional so the same method works for create and edit. */
export interface EmployeeFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string; // selected by visible label
  jobTitle?: string;
  hireDate?: string; // YYYY-MM-DD
  salary?: string | number;
  status?: 'active' | 'inactive';
}

export class EmployeeFormPage extends BasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly department: Locator;
  readonly jobTitle: Locator;
  readonly hireDate: Locator;
  readonly salary: Locator;
  readonly status: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId('first_name');
    this.lastName = page.getByTestId('last_name');
    this.email = page.getByTestId('email');
    this.department = page.getByTestId('department_id');
    this.jobTitle = page.getByTestId('job_title');
    this.hireDate = page.getByTestId('hire_date');
    this.salary = page.getByTestId('salary');
    this.status = page.getByTestId('status');
    this.saveButton = page.getByTestId('save-employee');
  }

  /** Fill only the fields provided in `data`; leaves the rest untouched. */
  async fill(data: EmployeeFormData): Promise<void> {
    if (data.firstName !== undefined) await this.firstName.fill(data.firstName);
    if (data.lastName !== undefined) await this.lastName.fill(data.lastName);
    if (data.email !== undefined) await this.email.fill(data.email);
    if (data.department !== undefined) await this.department.selectOption({ label: data.department });
    if (data.jobTitle !== undefined) await this.jobTitle.fill(data.jobTitle);
    if (data.hireDate !== undefined) await this.hireDate.fill(data.hireDate);
    if (data.salary !== undefined) await this.salary.fill(String(data.salary));
    if (data.status !== undefined) await this.status.selectOption(data.status);
  }

  /** Submit the form and return the list page object (the app redirects there). */
  async save(): Promise<EmployeesListPage> {
    await this.saveButton.click();
    return new EmployeesListPage(this.page);
  }
}
