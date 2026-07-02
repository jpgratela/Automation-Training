import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  createUser,
  findUserByUsername,
  verifyPassword,
  requireLogin,
} from '../auth';

export const webRouter = Router();

// ---------------------------------------------------------------------------
// Auth pages
// ---------------------------------------------------------------------------

webRouter.get('/', (req: Request, res: Response) => {
  res.redirect(req.session.userId ? '/dashboard' : '/login');
});

webRouter.get('/login', (req: Request, res: Response) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

webRouter.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = findUserByUsername(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).render('login', { error: 'Invalid username or password.' });
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.fullName = user.full_name;
  res.redirect('/dashboard');
});

webRouter.get('/register', (req: Request, res: Response) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { error: null });
});

webRouter.post('/register', (req: Request, res: Response) => {
  const { username, password, fullName } = req.body;
  if (!username || !password || !fullName) {
    return res.status(400).render('register', { error: 'All fields are required.' });
  }
  if (findUserByUsername(username)) {
    return res.status(409).render('register', { error: 'That username is already taken.' });
  }
  const user = createUser(username, password, fullName);
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.fullName = user.full_name;
  res.redirect('/dashboard');
});

webRouter.get('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ---------------------------------------------------------------------------
// Everything below requires a logged-in session.
// ---------------------------------------------------------------------------
webRouter.use(requireLogin);

webRouter.get('/dashboard', (_req: Request, res: Response) => {
  const employeeCount = (db.prepare('SELECT COUNT(*) AS c FROM employees').get() as { c: number }).c;
  const departmentCount = (db.prepare('SELECT COUNT(*) AS c FROM departments').get() as { c: number }).c;
  const activeCount = (
    db.prepare("SELECT COUNT(*) AS c FROM employees WHERE status = 'active'").get() as { c: number }
  ).c;
  res.render('dashboard', { employeeCount, departmentCount, activeCount });
});

// ---------------------------------------------------------------------------
// Departments CRUD
// ---------------------------------------------------------------------------

webRouter.get('/departments', (req, res) => {
  const name = (req.query.name as string | undefined)?.trim() || '';

  const where: string[] = [];
  const params: unknown[] = [];
  if (name) {
    where.push('name LIKE ?');
    params.push(`%${name}%`);
  }

  const sql =
    'SELECT * FROM departments' +
    (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
    ' ORDER BY name';
  const departments = db.prepare(sql).all(...params);
  res.render('departments/list', { departments, filters: { name } });
});

webRouter.get('/departments/new', (_req, res) => {
  res.render('departments/form', { department: {}, action: '/departments', title: 'New Department' });
});

webRouter.post('/departments', (req, res) => {
  const { name, description } = req.body;
  db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)').run(name, description || null);
  res.redirect('/departments');
});

webRouter.get('/departments/:id/edit', (req, res) => {
  const department = db.prepare('SELECT * FROM departments WHERE id = ?').get(req.params.id);
  if (!department) return res.redirect('/departments');
  res.render('departments/form', {
    department,
    action: `/departments/${req.params.id}`,
    title: 'Edit Department',
  });
});

webRouter.post('/departments/:id', (req, res) => {
  const { name, description } = req.body;
  db.prepare('UPDATE departments SET name = ?, description = ? WHERE id = ?').run(
    name,
    description || null,
    req.params.id
  );
  res.redirect('/departments');
});

webRouter.post('/departments/:id/delete', (req, res) => {
  db.prepare('DELETE FROM departments WHERE id = ?').run(req.params.id);
  res.redirect('/departments');
});

// ---------------------------------------------------------------------------
// Employees CRUD
// ---------------------------------------------------------------------------

webRouter.get('/employees', (req, res) => {
  const name = (req.query.name as string | undefined)?.trim() || '';
  const department = (req.query.department as string | undefined)?.trim() || '';
  const job_title = (req.query.job_title as string | undefined)?.trim() || '';
  let status = (req.query.status as string | undefined) || 'all';
  if (status !== 'active' && status !== 'inactive') status = 'all';

  const where: string[] = [];
  const params: unknown[] = [];
  if (name) {
    where.push("(e.first_name || ' ' || e.last_name) LIKE ?");
    params.push(`%${name}%`);
  }
  if (department) {
    where.push('d.name LIKE ?');
    params.push(`%${department}%`);
  }
  if (job_title) {
    where.push('e.job_title LIKE ?');
    params.push(`%${job_title}%`);
  }
  if (status !== 'all') {
    where.push('e.status = ?');
    params.push(status);
  }

  const sql =
    `SELECT e.*, d.name AS department_name
     FROM employees e LEFT JOIN departments d ON d.id = e.department_id` +
    (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
    ' ORDER BY e.last_name, e.first_name';
  const employees = db.prepare(sql).all(...params);
  res.render('employees/list', {
    employees,
    filters: { name, department, job_title, status },
  });
});

webRouter.get('/employees/new', (_req, res) => {
  const departments = db.prepare('SELECT * FROM departments ORDER BY name').all();
  res.render('employees/form', {
    employee: {},
    departments,
    action: '/employees',
    title: 'New Employee',
  });
});

webRouter.post('/employees', (req, res) => {
  const { first_name, last_name, email, department_id, job_title, hire_date, salary, status } =
    req.body;
  db.prepare(
    `INSERT INTO employees
      (first_name, last_name, email, department_id, job_title, hire_date, salary, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    first_name,
    last_name,
    email,
    department_id || null,
    job_title || null,
    hire_date || null,
    salary || null,
    status || 'active'
  );
  res.redirect('/employees');
});

webRouter.get('/employees/:id/edit', (req, res) => {
  const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!employee) return res.redirect('/employees');
  const departments = db.prepare('SELECT * FROM departments ORDER BY name').all();
  res.render('employees/form', {
    employee,
    departments,
    action: `/employees/${req.params.id}`,
    title: 'Edit Employee',
  });
});

webRouter.post('/employees/:id', (req, res) => {
  const { first_name, last_name, email, department_id, job_title, hire_date, salary, status } =
    req.body;
  db.prepare(
    `UPDATE employees SET
       first_name = ?, last_name = ?, email = ?, department_id = ?,
       job_title = ?, hire_date = ?, salary = ?, status = ?
     WHERE id = ?`
  ).run(
    first_name,
    last_name,
    email,
    department_id || null,
    job_title || null,
    hire_date || null,
    salary || null,
    status || 'active',
    req.params.id
  );
  res.redirect('/employees');
});

webRouter.post('/employees/:id/delete', (req, res) => {
  db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  res.redirect('/employees');
});
