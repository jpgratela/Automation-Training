import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';

// In a real app this comes from a secret manager / env. Fine for local learning.
export const JWT_SECRET = process.env.JWT_SECRET || 'local-dev-secret-change-me';
export const JWT_EXPIRES_IN = '8h';

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: string;
  created_at: string;
}

// Make the session user available to TypeScript.
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
    fullName?: string;
  }
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function findUserByUsername(username: string): UserRow | undefined {
  return db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username) as UserRow | undefined;
}

export function createUser(username: string, password: string, fullName: string): UserRow {
  const info = db
    .prepare('INSERT INTO users (username, password_hash, full_name) VALUES (?, ?, ?)')
    .run(username, hashPassword(password), fullName);
  return db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(info.lastInsertRowid) as UserRow;
}

export function signToken(user: UserRow): string {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Guard for UI (HTML) routes — relies on the session cookie.
 * Redirects browsers to the login page when not authenticated.
 */
export function requireLogin(req: Request, res: Response, next: NextFunction): void {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

/**
 * Guard for JSON API routes — relies on a Bearer token.
 * Returns 401 JSON instead of redirecting, which is what API tests expect.
 */
export function requireApiAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: number; username: string };
    (req as Request & { userId?: number }).userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
