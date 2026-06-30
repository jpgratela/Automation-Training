// Barrel file so tests can import every page object from one place:
//   import { LoginPage, EmployeesListPage } from '../pages';
// import { EmployeesListPage } from './Employees/EmployeesListPage';
// import { DepartmentListPage } from './Departments/DepartmentListPage';
// import { EmployeeFormData } from './Employees/EmployeeFormPage';

export { BasePage } from './BasePage';
export { LoginPage } from './LoginPage';
export { RegisterPage } from './RegisterPage';
export { DashboardPage } from './Dashboard/DashboardPage';
export { EmployeesListPage } from './Employees/EmployeesListPage';
export { EmployeeFormPage } from './Employees/EmployeeFormPage';
export type { EmployeeFormData } from './Employees/EmployeeFormPage';
