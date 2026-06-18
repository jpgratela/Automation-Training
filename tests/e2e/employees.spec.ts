import { test, expect, Page } from '@playwright/test';

// Log in as the seeded admin before each test in this file.
async function login(page: Page) {
  await page.goto('/login');
  await page.getByTestId('username').fill('admin@hr.test');
  await page.getByTestId('password').fill('Password123');
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.beforeEach(async ({ page }) => {
  await login(page);
});

test('create, edit, and delete an employee through the UI', async ({ page }) => {
  const unique = Date.now();
  const email = `playwright${unique}@hr.test`;

  // Create
  await page.goto('/employees');
  await page.getByTestId('new-employee').click();
  await page.getByTestId('first_name').fill('Pat');
  await page.getByTestId('last_name').fill('Tester');
  await page.getByTestId('email').fill(email);
  await page.getByTestId('job_title').fill('Automation Engineer');
  await page.getByTestId('save-employee').click();

  await expect(page).toHaveURL(/\/employees$/);
  const row = page.locator('[data-testid="employee-row"]', { hasText: email });
  await expect(row).toBeVisible();

  // Edit
  await row.getByTestId('edit-employee').click();
  await page.getByTestId('job_title').fill('Senior Automation Engineer');
  await page.getByTestId('save-employee').click();
  await expect(
    page.locator('[data-testid="employee-row"]', { hasText: 'Senior Automation Engineer' })
  ).toBeVisible();

  // Delete (auto-accept the confirm dialog)
  page.on('dialog', (d) => d.accept());
  await page
    .locator('[data-testid="employee-row"]', { hasText: email })
    .getByTestId('delete-employee')
    .click();
  await expect(page.locator('[data-testid="employee-row"]', { hasText: email })).toHaveCount(0);
});

test('the employees list shows the seeded staff', async ({ page }) => {
  await page.goto('/employees');
  await expect(page.locator('[data-testid="employee-row"]')).not.toHaveCount(0);
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
});
