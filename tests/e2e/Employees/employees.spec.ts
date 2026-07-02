import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages";
import { EmployeesListPage } from "../../pages/Employees/EmployeesListPage";
import { ADMIN, uniqueEmail } from "../../test-data";

// login as admin
test.beforeEach('login', async({ page }) => {
    await new LoginPage(page).loginAs(ADMIN.username, ADMIN.password);
})

test('create, search, edit, and delete employee', async({ page }) => {
    const emailAddress = uniqueEmail('playwright');
    const employee = new EmployeesListPage(page);
    await employee.goto();

    // Create
    const newForm = await employee.clickNew();
    await newForm.fillData({
        firstName: 'Pat',
        lastName: 'Tester',
        emailAddress,
        department: 'Engineering',
        jobTitle: 'Automation Engineer',
    });
    await newForm.save();
    await employee.expectVisible(emailAddress);

    // Search
    await employee.searchEmployee({
        name: 'Tester',
        department: 'Engineering',
        jobTitle: 'Automation',
        status: 'active'
    });
    await employee.expectVisible(emailAddress);
    await expect(employee.rows).toHaveCount(1);

    // Edit
    const editForm = await employee.edit(emailAddress);
    await editForm.fillData({ jobTitle : 'Software QA Engineer'});
    await editForm.save();
    await expect(employee.row(emailAddress)).toContainText('Software QA Engineer');

    // Delete
    await employee.delete(emailAddress);
    await employee.expectDeleted(emailAddress);
})