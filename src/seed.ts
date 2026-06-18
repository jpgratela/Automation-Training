import { db, initSchema } from './db';
import { hashPassword } from './auth';

// Seed the database with a default login and sample HR data.
// Safe to re-run: it clears existing rows first.
initSchema();

console.log('Seeding database...');

db.exec('DELETE FROM employees; DELETE FROM departments; DELETE FROM users;');

const DEFAULT_USER = { username: 'admin@hr.test', password: 'Password123', fullName: 'HR Admin' };

db.prepare('INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)').run(
  DEFAULT_USER.username,
  hashPassword(DEFAULT_USER.password),
  DEFAULT_USER.fullName,
  'admin'
);

const departments = [
  ['Engineering', 'Builds and maintains the product'],
  ['Human Resources', 'People operations and hiring'],
  ['Sales', 'Revenue and client relationships'],
];
const deptIds: Record<string, number> = {};
for (const [name, description] of departments) {
  const info = db
    .prepare('INSERT INTO departments (name, description) VALUES (?, ?)')
    .run(name, description);
  deptIds[name] = Number(info.lastInsertRowid);
}

const employees = [
  ['Ada', 'Lovelace', 'ada@hr.test', 'Engineering', 'Senior Engineer', '2022-01-15', 120000],
  ['Grace', 'Hopper', 'grace@hr.test', 'Engineering', 'Engineering Manager', '2021-06-01', 145000],
  ['Mary', 'Jackson', 'mary@hr.test', 'Human Resources', 'HR Specialist', '2023-03-20', 78000],
  ['Alan', 'Turing', 'alan@hr.test', 'Sales', 'Account Executive', '2023-09-10', 90000],
];
for (const [first, last, email, dept, title, hire, salary] of employees) {
  db.prepare(
    `INSERT INTO employees
      (first_name, last_name, email, department_id, job_title, hire_date, salary)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(first, last, email, deptIds[dept as string], title, hire, salary);
}

console.log(`Seeded ${departments.length} departments and ${employees.length} employees.`);
console.log(`Default login -> username: ${DEFAULT_USER.username}  password: ${DEFAULT_USER.password}`);
