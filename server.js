// Express backend — POS server
// Serves the API in both dev and production.
// In production (NODE_ENV=production) also serves the built frontend from ./dist

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Configuration ────────────────────────────────────────────────────────────
const PORT    = Number(process.env.PORT ?? 3001);
const IS_PROD = process.env.NODE_ENV === 'production';
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE  = path.join(DATA_DIR, 'pos.db');
const DIST_DIR = path.join(__dirname, 'dist');

if (!process.env.JWT_SECRET && IS_PROD) {
  console.error('FATAL: Set the JWT_SECRET environment variable before running in production.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET ?? crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('⚠  JWT_SECRET not set — using a random secret. All sessions reset on restart. Set JWT_SECRET in production.');
}

// ── Database ─────────────────────────────────────────────────────────────────
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY,
    username      TEXT    UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY,
    order_id    TEXT    UNIQUE NOT NULL,
    timestamp   INTEGER NOT NULL,
    items       TEXT    NOT NULL DEFAULT '[]',
    total       REAL    NOT NULL,
    is_manual   INTEGER NOT NULL DEFAULT 0,
    manual_note TEXT,
    created_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_orders_ts ON orders (timestamp);
`);

// Bootstrap admin user.
// • First run (no users): create from env vars or defaults (admin/admin).
// • Subsequent runs: if ADMIN_PASSWORD env var is explicitly set, update the
//   stored hash so the password stays in sync with the env var.
const uname = process.env.ADMIN_USER ?? 'admin';
const rawPw = process.env.ADMIN_PASSWORD ?? 'admin';

const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(uname);
if (!existingUser) {
  const hash = bcrypt.hashSync(rawPw, 12);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(uname, hash);
  console.log(`✅  Admin user "${uname}" created.`);
} else if (process.env.ADMIN_PASSWORD) {
  // Env var explicitly set → keep hash in sync
  const hash = bcrypt.hashSync(rawPw, 12);
  db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hash, uname);
  console.log(`🔄  Password for "${uname}" updated from ADMIN_PASSWORD env var.`);
}

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();

app.use(helmet({
  // In dev the CSP would block Vite HMR; Express only serves API in dev anyway
  contentSecurityPolicy: IS_PROD,
}));
app.use(express.json({ limit: '512kb' }));
app.use(cookieParser());

// Strict rate limit for auth endpoints: 10 attempts / 15 min / IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Příliš mnoho přihlašovacích pokusů. Zkuste to za 15 minut.' },
});

// ── Auth helpers ──────────────────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  res.cookie('pos_token', token, {
    httpOnly: true,
    secure: IS_PROD,        // HTTPS-only in production
    sameSite: 'strict',     // CSRF mitigation
    maxAge: 7 * 24 * 3600 * 1000,
    path: '/',
  });
}

function requireAuth(req, res, next) {
  const token = req.cookies?.pos_token;
  if (!token) return res.status(401).json({ error: 'Nepřihlášen' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.clearCookie('pos_token', { path: '/' });
    res.status(401).json({ error: 'Platnost přihlášení vypršela' });
  }
}

// ── Auth routes ───────────────────────────────────────────────────────────────
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ error: 'Chybí uživatelské jméno nebo heslo' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
  // Use constant-time comparison to prevent timing attacks
  const hash = user?.password_hash ?? '$2a$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  const ok   = bcrypt.compareSync(password, hash);
  if (!user || !ok) {
    return res.status(401).json({ error: 'Nesprávné přihlašovací údaje' });
  }

  setAuthCookie(res, signToken(user.id));
  res.json({ ok: true, username: user.username });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('pos_token', { path: '/' });
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(req.user.sub);
  if (!user) { res.clearCookie('pos_token'); return res.status(401).json({ error: 'Uživatel nenalezen' }); }
  res.json({ id: user.id, username: user.username });
});

app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'Nové heslo musí mít alespoň 8 znaků' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.sub);
  if (!bcrypt.compareSync(currentPassword ?? '', user.password_hash)) {
    return res.status(401).json({ error: 'Nesprávné aktuální heslo' });
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .run(bcrypt.hashSync(newPassword, 12), user.id);
  res.json({ ok: true });
});

// Change password from the login screen (no active session needed —
// current credentials are verified before accepting the new password)
app.post('/api/auth/change-password-unauthenticated', authLimiter, (req, res) => {
  const { username, currentPassword, newPassword } = req.body ?? {};
  if (
    typeof username !== 'string' || !username ||
    typeof currentPassword !== 'string' || !currentPassword ||
    typeof newPassword !== 'string' || newPassword.length < 8
  ) {
    return res.status(400).json({ error: 'Nové heslo musí mít alespoň 8 znaků' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
  const hash = user?.password_hash ?? '$2a$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  if (!user || !bcrypt.compareSync(currentPassword, hash)) {
    return res.status(401).json({ error: 'Nesprávné přihlašovací údaje' });
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .run(bcrypt.hashSync(newPassword, 12), user.id);
  res.json({ ok: true });
});

// ── Order routes ──────────────────────────────────────────────────────────────
app.get('/api/orders', requireAuth, (_req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY timestamp DESC').all();
  res.json(rows.map(r => ({
    id:         r.order_id,
    timestamp:  r.timestamp,
    items:      JSON.parse(r.items),
    total:      r.total,
    isManual:   r.is_manual === 1,
    manualNote: r.manual_note ?? undefined,
  })));
});

app.post('/api/orders', requireAuth, (req, res) => {
  const { id, timestamp, items, total, isManual, manualNote } = req.body ?? {};
  if (!id || !timestamp || total == null) {
    return res.status(400).json({ error: 'Chybí povinná pole (id, timestamp, total)' });
  }
  try {
    db.prepare(
      'INSERT INTO orders (order_id, timestamp, items, total, is_manual, manual_note) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      String(id), Number(timestamp),
      JSON.stringify(Array.isArray(items) ? items : []),
      Number(total),
      isManual ? 1 : 0,
      manualNote ? String(manualNote) : null,
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Objednávka s tímto ID již existuje' });
    }
    throw e;
  }
});

// ── Serve built frontend in production ────────────────────────────────────────
if (IS_PROD && fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false }));
  app.use((_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`POS server → http://localhost:${PORT}  [${IS_PROD ? 'production' : 'development'}]`);
});
