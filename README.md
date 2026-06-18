# HR System — Automation Practice App

A small, local **HR management** web app built to practice **Playwright UI testing**,
**API automation testing**, and **CI/CD (Jenkins)**. It runs entirely on your machine —
no web hosting required.

It starts small (auth + employees + departments) and is designed to **grow on demand** so
new commits keep triggering your CI pipeline.

---

## Tech stack

| Layer      | Choice                                   |
|------------|------------------------------------------|
| Backend    | Node.js + Express (TypeScript, run via `tsx`) |
| Database   | SQLite (file at `data/app.db`, persists between restarts) |
| UI         | Server-rendered EJS + Bootstrap 5 (CDN)  |
| Auth (UI)  | Session cookie (`express-session`)       |
| Auth (API) | JWT Bearer token                         |
| Tests      | Playwright (`@playwright/test`) — E2E + API |

---

## Prerequisites

- Node.js 18+ (built on v22)
- The Playwright Chromium browser. This machine sits behind an SSL-inspecting proxy that
  blocks `playwright install`, so this project is **pinned to `@playwright/test@1.55.1`** to
  reuse the browser already cached on the machine. If `npx playwright install` works for you,
  you can unpin it.

## Setup

```bash
npm install
npm run seed     # creates data/app.db with a default user + sample data
npm start        # http://localhost:3000
```

**Default login:** `admin@hr.test` / `Password123`

| Script           | What it does                                   |
|------------------|------------------------------------------------|
| `npm start`      | Start the server on http://localhost:3000      |
| `npm run dev`    | Start with auto-reload (`tsx watch`)           |
| `npm run seed`   | Reset the DB to known sample data              |
| `npm test`       | Run all Playwright tests (auto-starts + seeds the app) |
| `npm run test:e2e` | UI tests only                                |
| `npm run test:api` | API tests only                              |

> `npm test` uses Playwright's `webServer` to seed and boot the app automatically,
> so you don't need a server running first.

---

## What's in the app (Phase 1)

- **Auth** — registration, login, logout (session for UI, JWT for API)
- **Employees** — full CRUD (UI + REST API)
- **Departments** — full CRUD (UI + REST API), linked to employees
- **Dashboard** — headcount stats

### REST API

All `/api/*` routes except auth require an `Authorization: Bearer <token>` header.

```
POST   /api/auth/register      { username, password, fullName }
POST   /api/auth/login         { username, password }  -> { token, user }

GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id

GET|POST|PUT|DELETE  /api/departments[/:id]

GET    /healthz                (no auth — used by CI to confirm the app is up)
```

---

## Project structure

```
src/
  server.ts            # Express app entry (middleware, routes, sessions)
  db.ts                # SQLite connection + schema (add new tables here)
  auth.ts              # password hashing, JWT, route guards
  seed.ts              # resets DB to known sample data
  routes/
    web.ts             # HTML/UI routes (session auth)
    api.ts             # JSON API routes (JWT auth)
  views/               # EJS + Bootstrap templates
tests/
  e2e/                 # Playwright UI tests
  api/                 # Playwright API tests
playwright.config.ts   # auto-seeds + starts the app before tests
```

UI elements carry `data-testid` attributes for stable Playwright selectors.

---

## Growing the app (to keep triggering CI)

Each new module follows the same pattern, which is the workflow to practice:

1. Add a table in `src/db.ts` (`initSchema`).
2. Add API routes in `src/routes/api.ts` + UI routes in `src/routes/web.ts`.
3. Add EJS views under `src/views/`.
4. Add tests under `tests/e2e/` and `tests/api/`.
5. Commit & push → CI runs the growing suite.

Candidate next modules: **Leave Requests**, **Job Positions**, **Attendance**,
**Payroll**, **role-based access control**, **search & pagination**.

> Ask and I'll add the next module end-to-end (DB + API + UI + tests).
