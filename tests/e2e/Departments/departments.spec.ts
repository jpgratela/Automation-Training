import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages";
import { ADMIN, uniqueEmail } from "../../test-data";
import { DepartmentListPage } from "../../pages/Departments/DepartmentListPage";

// login as admin
test.beforeEach('login', async({ page }) => {
    await new LoginPage(page).loginAs(ADMIN.username, ADMIN.password);
})

test('create, edit, and delete departments', async({ page }) => {
    const department = new DepartmentListPage(page);

    await department.goto();
})