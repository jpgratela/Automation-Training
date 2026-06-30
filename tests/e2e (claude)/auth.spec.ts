import { test, expect } from '@playwright/test';
import { LoginPage, RegisterPage, DashboardPage } from '../pages (claude)';
import { ADMIN, uniqueEmail } from '../test-data';

// UI tests for registration, login, and logout — driven through page objects.

test('a new user can register and lands on the dashboard', async ({ page }) => {
  const registerPage = new RegisterPage(page);
  const dashboard = new DashboardPage(page);

  await registerPage.goto();
  await registerPage.register('New Tester', uniqueEmail('user'), 'Password123');

  await expect(page).toHaveURL(/\/dashboard/);
  await dashboard.expectLoaded();
});

test('the seeded admin can log in and log out', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboard = new DashboardPage(page);

  await loginPage.loginAs(ADMIN.username, ADMIN.password);

  await dashboard.logout();
  await expect(page).toHaveURL(/\/login/);
});

test('logging in with bad credentials shows an error', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(ADMIN.username, 'wrong-password');

  await loginPage.expectError('Invalid');
});
