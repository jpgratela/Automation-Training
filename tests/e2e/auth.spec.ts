import { test, expect } from '@playwright/test';

// UI tests for registration, login, and logout.

test('a new user can register and lands on the dashboard', async ({ page }) => {
  const unique = Date.now();
  const email = `user${unique}@hr.test`;

  await page.goto('/register');
  await page.getByTestId('fullName').fill('New Tester');
  await page.getByTestId('username').fill(email);
  await page.getByTestId('password').fill('Password123');
  await page.getByTestId('register-submit').click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByTestId('stat-employees')).toBeVisible();
});

test('the seeded admin can log in and log out', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('username').fill('admin@hr.test');
  await page.getByTestId('password').fill('Password123');
  await page.getByTestId('login-submit').click();

  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByTestId('logout').click();
  await expect(page).toHaveURL(/\/login/);
});

test('logging in with bad credentials shows an error', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('username').fill('admin@hr.test');
  await page.getByTestId('password').fill('wrong-password');
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('login-error')).toContainText('Invalid');
});
