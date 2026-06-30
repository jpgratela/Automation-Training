import { test, expect } from '@playwright/test';
import { HrApiClient } from './HrApiClient';
import { ADMIN, uniqueEmail } from '../test-data';

// API automation tests hitting the JSON endpoints under /api,
// driven through the HrApiClient wrapper.

test('login returns a token; bad credentials return 401', async ({ request }) => {
  const api = new HrApiClient(request);

  const ok = await api.login(ADMIN.username, ADMIN.password);
  expect(ok.status()).toBe(200);
  expect((await ok.json()).token).toBeTruthy();

  const bad = await api.login(ADMIN.username, 'nope');
  expect(bad.status()).toBe(401);
});

test('protected endpoints reject requests without a token', async ({ request }) => {
  const api = new HrApiClient(request); // never logs in -> no token
  const res = await api.listEmployees();
  expect(res.status()).toBe(401);
});

test('full employee CRUD over the API', async ({ request }) => {
  const api = new HrApiClient(request);
  await api.login(ADMIN.username, ADMIN.password);
  const email = uniqueEmail('api');

  // Create
  const created = await api.createEmployee({
    first_name: 'Api',
    last_name: 'Tester',
    email,
    job_title: 'SDET',
  });
  expect(created.status()).toBe(201);
  const employee = await created.json();
  expect(employee.id).toBeGreaterThan(0);

  // Read
  const read = await api.getEmployee(employee.id);
  expect(read.status()).toBe(200);
  expect((await read.json()).email).toBe(email);

  // Update
  const updated = await api.updateEmployee(employee.id, { job_title: 'Lead SDET' });
  expect(updated.status()).toBe(200);
  expect((await updated.json()).job_title).toBe('Lead SDET');

  // Delete
  const deleted = await api.deleteEmployee(employee.id);
  expect(deleted.status()).toBe(204);

  const gone = await api.getEmployee(employee.id);
  expect(gone.status()).toBe(404);
});

test('creating an employee with a duplicate email returns 409', async ({ request }) => {
  const api = new HrApiClient(request);
  await api.login(ADMIN.username, ADMIN.password);

  // ada@hr.test is created by the seed script.
  const res = await api.createEmployee({
    first_name: 'Dup',
    last_name: 'Licate',
    email: 'ada@hr.test',
  });
  expect(res.status()).toBe(409);
});
