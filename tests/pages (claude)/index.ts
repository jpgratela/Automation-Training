// Barrel file so tests can import every page object from one place:
//   import { LoginPage, EmployeesListPage } from '../pages';
export { BasePage } from './BasePage';
export { LoginPage } from './LoginPage';
export { RegisterPage } from './RegisterPage';
export { DashboardPage } from './DashboardPage';
export { EmployeesListPage } from './EmployeesListPage';
export { EmployeeFormPage } from './EmployeeFormPage';
export type { EmployeeFormData } from './EmployeeFormPage';
