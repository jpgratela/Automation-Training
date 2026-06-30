import { test, expect } from '@playwright/test';
import { LoginPage, EmployeesListPage } from '../pages (claude)';
import { ADMIN, uniqueEmail } from '../test-data';

// Log in as the seeded admin before each test in this file.
test.beforeEach(async ({ page }) => {
  await new LoginPage(page).loginAs(ADMIN.username, ADMIN.password);
});

test('create, edit, and delete an employee through the UI', async ({ page }) => {
  const email = uniqueEmail('playwright');
  const employees = new EmployeesListPage(page);
  await employees.goto();

  // Create
  const newForm = await employees.clickNew();
  await newForm.fill({
    firstName: 'Pat',
    lastName: 'Tester',
    email,
    jobTitle: 'Automation Engineer',
  });
  await newForm.save();
  await employees.expectRowVisible(email);

  // Edit
  const editForm = await employees.edit(email);
  await editForm.fill({ jobTitle: 'Senior Automation Engineer' });
  await editForm.save();
  await employees.expectRowVisible('Senior Automation Engineer');

  // Delete
  await employees.delete(email);
  await employees.expectRowAbsent(email);
});

test('the employees list shows the seeded staff', async ({ page }) => {
  const employees = new EmployeesListPage(page);
  await employees.goto();

  await expect(employees.rows).not.toHaveCount(0);
  await employees.expectRowVisible('Ada Lovelace');
});
