import { test, expect } from "@playwright/test";
import { LoginPage, RegisterPage } from "../pages";
import { ADMIN, uniqueEmail } from '../test-data';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';

test('a new user can register and lands on the dashboard', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);

    await registerPage.goto();
    // await registerPage.register('Mikmik Gratela', 'mikmik', 'Password123');
    await registerPage.register('New Tester', uniqueEmail('user'), 'Password123');

    await expect(page).toHaveURL(/\/dashboard/);
});

test('the admin can login successfully and logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.loginAs(ADMIN.username, ADMIN.password);
    await dashboardPage.logout();
    await expect(page).toHaveURL(/\/login/);
});