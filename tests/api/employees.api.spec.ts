import { test, expect, APIRequestContext } from '@playwright/test';

// API automation tests hitting the JSON endpoints under /api.

async function getToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/api/auth/login', {
    data: { username: 'admin@hr.test', password: 'Password123' },
  });
  expect(res.status()).toBe(200);
  return (await res.json()).token;
}

test('login returns a token; bad credentials return 401', async ({ request }) => {
  const ok = await request.post('/api/auth/login', {
    data: { username: 'admin@hr.test', password: 'Password123' },
  });
  expect(ok.status()).toBe(200);
  expect((await ok.json()).token).toBeTruthy();

  const bad = await request.post('/api/auth/login', {
    data: { username: 'admin@hr.test', password: 'nope' },
  });
  expect(bad.status()).toBe(401);
});

test('protected endpoints reject requests without a token', async ({ request }) => {
  const res = await request.get('/api/employees');
  expect(res.status()).toBe(401);
});

test('full employee CRUD over the API', async ({ request }) => {
  const token = await getToken(request);
  const headers = { Authorization: `Bearer ${token}` };
  const email = `api${Date.now()}@hr.test`;

  // Create
  const created = await request.post('/api/employees', {
    headers,
    data: { first_name: 'Api', last_name: 'Tester', email, job_title: 'SDET' },
  });
  expect(created.status()).toBe(201);
  const employee = await created.json();
  expect(employee.id).toBeGreaterThan(0);

  // Read
  const read = await request.get(`/api/employees/${employee.id}`, { headers });
  expect(read.status()).toBe(200);
  expect((await read.json()).email).toBe(email);

  // Update
  const updated = await request.put(`/api/employees/${employee.id}`, {
    headers,
    data: { job_title: 'Lead SDET' },
  });
  expect(updated.status()).toBe(200);
  expect((await updated.json()).job_title).toBe('Lead SDET');

  // Delete
  const deleted = await request.delete(`/api/employees/${employee.id}`, { headers });
  expect(deleted.status()).toBe(204);

  const gone = await request.get(`/api/employees/${employee.id}`, { headers });
  expect(gone.status()).toBe(404);
});

test('creating an employee with a duplicate email returns 409', async ({ request }) => {
  const token = await getToken(request);
  const headers = { Authorization: `Bearer ${token}` };

  // ada@hr.test is created by the seed script.
  const res = await request.post('/api/employees', {
    headers,
    data: { first_name: 'Dup', last_name: 'Licate', email: 'ada@hr.test' },
  });
  expect(res.status()).toBe(409);
});
