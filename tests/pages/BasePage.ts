import { Page, Locator } from "@playwright/test";

export class BasePage{
    readonly page: Page;
    readonly navDashboard: Locator;
    readonly navEmployees: Locator;
    readonly navDepartments: Locator;
    readonly logoutButton: Locator;

    constructor(page: Page){
        this.page = page;
        this.navDashboard = page.getByTestId('nav-dashboard');
        this.navEmployees = page.getByTestId('nav-employees');
        this.navDepartments = page.getByTestId('nav-departments');
        this.logoutButton = page.getByTestId('logout');
    }

    async gotoDashboard(){
        this.navDashboard.click();
    }
    
    async gotoEmployees(){
        this.navEmployees.click();
    }

    async gotoDepartments(){
        this.navDepartments.click();
    }

    async logout(){
        this.logoutButton.click();
    }
}