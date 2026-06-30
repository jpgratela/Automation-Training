import { Locator, Page } from "@playwright/test";
import { DepartmentListPage } from './DepartmentListPage';
import { BasePage } from "../BasePage";

export interface DepartmentFormData {
    name? : string;
    description? : string;
}

export class DepartmentFormPage extends BasePage {
    readonly name : Locator;
    readonly description : Locator;
    readonly saveButton : Locator;

    constructor(page:Page){
        super(page);

        this.name = page.getByTestId('name');
        this.description = page.getByTestId('description');
        this.saveButton = page.getByTestId('save-department');
    }

    async fillData(data: DepartmentFormData): Promise<void>{
        if(data.name !== undefined) await this.name.fill(data.name);
        if(data.description !== undefined) await this.description.fill(data.description);
    }

    async save(): Promise<DepartmentListPage>{
        await this.saveButton.click();
        return new DepartmentListPage(this.page);
    }
}