import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  createUser,
  findUserByUsername,
  signToken,
  verifyPassword,
  requireApiAuth,
} from '../auth';

export const apiRouter = Router();

// ---------------------------------------------------------------------------
// Auth (public)
// ---------------------------------------------------------------------------

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { username, password, fullName } = req.body || {};
  if (!username || !password || !fullName) {
    return res.status(400).json({ error: 'username, password and fullName are required' });
  }
  if (findUserByUsername(username)) {
    return res.status(409).json({ error: 'username already exists' });
  }
  const user = createUser(username, password, fullName);
  const token = signToken(user);
  return res.status(201).json({
    token,
    user: { id: user.id, username: user.username, fullName: user.full_name },
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  const user = findUserByUsername(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const token = signToken(user);
  return res.json({
    token,
    user: { id: user.id, username: user.username, fullName: user.full_name },
  });
});

// Everything below this line requires a valid Bearer token.
apiRouter.use(requireApiAuth);

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------

apiRouter.get('/departments', (_req, res) => {
  res.json(db.prepare('SELECT * FROM departments ORDER BY name').all());
});

apiRouter.get('/departments/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM departments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'department not found' });
  res.json(row);
});

apiRouter.post('/departments', (req, res) => {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  if (db.prepare('SELECT 1 FROM departments WHERE name = ?').get(name)) {
    return res.status(409).json({ error: 'department name already exists' });
  }
  const info = db
    .prepare('INSERT INTO departments (name, description) VALUES (?, ?)')
    .run(name, description ?? null);
  res.status(201).json(db.prepare('SELECT * FROM departments WHERE id = ?').get(info.lastInsertRowid));
});

apiRouter.put('/departments/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM departments WHERE id = ?').get(req.params.id) as
    | { name: string; description: string | null }
    | undefined;
  if (!existing) return res.status(404).json({ error: 'department not found' });
  const { name, description } = req.body || {};
  db.prepare('UPDATE departments SET name = ?, description = ? WHERE id = ?').run(
    name ?? existing.name,
    description ?? existing.description,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM departments WHERE id = ?').get(req.params.id));
});

apiRouter.delete('/departments/:id', (req, res) => {
  const info = db.prepare('DELETE FROM departments WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'department not found' });
  res.status(204).end();
});

// ---------------------------------------------------------------------------
// Employees
// ---------------------------------------------------------------------------

apiRouter.get('/employees', (_req, res) => {
  res.json(
    db
      .prepare(
        `SELECT e.*, d.name AS department_name
         FROM employees e LEFT JOIN departments d ON d.id = e.department_id
         ORDER BY e.last_name, e.first_name`
      )
      .all()
  );
});

apiRouter.get('/employees/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'employee not found' });
  res.json(row);
});

apiRouter.post('/employees', (req, res) => {
  const { first_name, last_name, email, department_id, job_title, hire_date, salary, status } =
    req.body || {};
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'first_name, last_name and email are required' });
  }
  if (db.prepare('SELECT 1 FROM employees WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'email already exists' });
  }
  const info = db
    .prepare(
      `INSERT INTO employees
        (first_name, last_name, email, department_id, job_title, hire_date, salary, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      first_name,
      last_name,
      email,
      department_id ?? null,
      job_title ?? null,
      hire_date ?? null,
      salary ?? null,
      status ?? 'active'
    );
  res.status(201).json(db.prepare('SELECT * FROM employees WHERE id = ?').get(info.lastInsertRowid));
});

apiRouter.put('/employees/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id) as
    | Record<string, unknown>
    | undefined;
  if (!existing) return res.status(404).json({ error: 'employee not found' });
  const b = req.body || {};
  db.prepare(
    `UPDATE employees SET
       first_name = ?, last_name = ?, email = ?, department_id = ?,
       job_title = ?, hire_date = ?, salary = ?, status = ?
     WHERE id = ?`
  ).run(
    b.first_name ?? existing.first_name,
    b.last_name ?? existing.last_name,
    b.email ?? existing.email,
    b.department_id ?? existing.department_id,
    b.job_title ?? existing.job_title,
    b.hire_date ?? existing.hire_date,
    b.salary ?? existing.salary,
    b.status ?? existing.status,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id));
});

apiRouter.delete('/employees/:id', (req, res) => {
  const info = db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'employee not found' });
  res.status(204).end();
});
