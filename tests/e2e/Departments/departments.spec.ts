import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages";
import { ADMIN, uniqueEmail } from "../../test-data";
import { DepartmentListPage } from "../../pages/Departments/DepartmentListPage";

// login as admin
test.beforeEach('login', async({ page }) => {
    await new LoginPage(page).loginAs(ADMIN.username, ADMIN.password);
})

test('create, search, edit, and delete departments', async({ page }) => {
    const uniqueName = 'Veterinary';
    const department = new DepartmentListPage(page);
    await department.goto();

    // Create
    const newForm = await department.clickNew();
    await newForm.fillData({
        name: uniqueName,
        description: 'Department of Veterinary medicine'
    });
    await newForm.save();
    await department.expectVisible(uniqueName);

    // Search
    await department.searchDepartment(uniqueName);
    await department.searchButton.click();
    await department.expectVisible('Veterinary');

    // Edit
    const editForm = await department.edit(uniqueName);
    await editForm.fillData({ description : 'Department of Architecture' });
    await editForm.save();
    await department.expectVisible('Department of Architecture');

    // Delete
    await department.delete(uniqueName);
    await department.expectDeleted(uniqueName);
})