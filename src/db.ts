import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Store the SQLite file under /data so it persists between restarts.
const dataDir = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'app.db');
export const db = new Database(dbPath);

// Pragmas: WAL for better concurrency, enforce foreign keys.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Create tables if they do not yet exist. Called once on startup.
 * Add new tables here as the app grows (this is what you'll touch
 * when adding new HR modules later).
 */
export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name     TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'user',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS departments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS employees (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      job_title     TEXT,
      hire_date     TEXT,
      salary        REAL,
      status        TEXT NOT NULL DEFAULT 'active',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
