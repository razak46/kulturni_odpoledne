// Express backend — POS server
// Requires DATABASE_URL (Neon / any PostgreSQL connection string).
// In production (NODE_ENV=production) also serves the built frontend from ./dist
// On Vercel, only the Express app is exported — listening is skipped.

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Configuration ────────────────────────────────────────────────────────────
const PORT    = Number(process.env.PORT ?? 3001);
const IS_PROD = process.env.NODE_ENV === 'production';
const DIST_DIR = path.join(__dirname, 'dist');

if (!process.env.JWT_SECRET && IS_PROD) {
  console.error('FATAL: Set the JWT_SECRET environment variable before running in production.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET ?? crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('⚠  JWT_SECRET not set — using a random secret. All sessions reset on restart. Set JWT_SECRET in production.');
}

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is required. Get a free database at https://neon.tech and set DATABASE_URL. See .env.example.');
  process.exit(1);
}

// ── Database ─────────────────────────────────────────────────────────────────
const sql = neon(process.env.DATABASE_URL);

async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      username      TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id          SERIAL PRIMARY KEY,
      order_id    TEXT UNIQUE NOT NULL,
      timestamp   BIGINT NOT NULL,
      items       TEXT NOT NULL DEFAULT '[]',
      total       REAL NOT NULL,
      is_manual   BOOLEAN NOT NULL DEFAULT FALSE,
      manual_note TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_ts ON orders (timestamp)`;

  // Bootstrap admin user.
  // • First run (no users): create from env vars or defaults (admin/admin).
  // • Subsequent runs: if ADMIN_PASSWORD env var is explicitly set, update the
  //   stored hash so the password stays in sync with the env var.
  const uname = process.env.ADMIN_USER     ?? 'admin';
  const rawPw = process.env.ADMIN_PASSWORD ?? 'admin';
  const hash  = await bcrypt.hash(rawPw, 12);
  if (process.env.ADMIN_PASSWORD) {
    // Env var explicitly set → create or overwrite (atomic upsert)
    await sql`
      INSERT INTO users (username, password_hash) VALUES (${uname}, ${hash})
      ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
    `;
    console.log(`✅  Admin user "${uname}" created or updated from ADMIN_PASSWORD env var.`);
  } else {
    // Default credentials → create only if not exists (atomic, no race condition)
    await sql`
      INSERT INTO users (username, password_hash) VALUES (${uname}, ${hash})
      ON CONFLICT (username) DO NOTHING
    `;
    console.log(`✅  Admin user "${uname}" ensured.`);
  }
}

// Run once per process / cold start; all request handlers await this promise.
const dbReady = initDb();

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();

app.use(helmet({ contentSecurityPolicy: IS_PROD }));
app.use(express.json({ limit: '512kb' }));
app.use(cookieParser());

// Ensure DB is initialised before handling any request
app.use(async (_req, _res, next) => {
  try { await dbReady; next(); }
  catch (err) { next(err); }
});

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
    secure: IS_PROD,
    sameSite: 'strict',
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
app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return res.status(400).json({ error: 'Chybí uživatelské jméno nebo heslo' });
    }
    const [user] = await sql`SELECT * FROM users WHERE LOWER(username) = LOWER(${username.trim()})`;
    // Use constant-time comparison to prevent timing attacks
    const hash = user?.password_hash ?? '$2a$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const ok   = await bcrypt.compare(password, hash);
    if (!user || !ok) return res.status(401).json({ error: 'Nesprávné přihlašovací údaje' });
    setAuthCookie(res, signToken(user.id));
    res.json({ ok: true, username: user.username });
  } catch (err) { next(err); }
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('pos_token', { path: '/' });
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAuth, async (req, res, next) => {
  try {
    const [user] = await sql`SELECT id, username FROM users WHERE id = ${req.user.sub}`;
    if (!user) { res.clearCookie('pos_token'); return res.status(401).json({ error: 'Uživatel nenalezen' }); }
    res.json({ id: user.id, username: user.username });
  } catch (err) { next(err); }
});

app.post('/api/auth/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {};
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'Nové heslo musí mít alespoň 8 znaků' });
    }
    const [user] = await sql`SELECT * FROM users WHERE id = ${req.user.sub}`;
    if (!await bcrypt.compare(currentPassword ?? '', user.password_hash)) {
      return res.status(401).json({ error: 'Nesprávné aktuální heslo' });
    }
    await sql`UPDATE users SET password_hash = ${await bcrypt.hash(newPassword, 12)} WHERE id = ${user.id}`;
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Change password from the login screen (no active session needed —
// current credentials are verified before accepting the new password)
app.post('/api/auth/change-password-unauthenticated', authLimiter, async (req, res, next) => {
  try {
    const { username, currentPassword, newPassword } = req.body ?? {};
    if (
      typeof username !== 'string' || !username ||
      typeof currentPassword !== 'string' || !currentPassword ||
      typeof newPassword !== 'string' || newPassword.length < 8
    ) {
      return res.status(400).json({ error: 'Nové heslo musí mít alespoň 8 znaků' });
    }
    const [user] = await sql`SELECT * FROM users WHERE LOWER(username) = LOWER(${username.trim()})`;
    const hash = user?.password_hash ?? '$2a$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    if (!user || !await bcrypt.compare(currentPassword, hash)) {
      return res.status(401).json({ error: 'Nesprávné přihlašovací údaje' });
    }
    await sql`UPDATE users SET password_hash = ${await bcrypt.hash(newPassword, 12)} WHERE id = ${user.id}`;
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Order routes ──────────────────────────────────────────────────────────────
app.get('/api/orders', requireAuth, async (_req, res, next) => {
  try {
    const rows = await sql`SELECT * FROM orders ORDER BY timestamp DESC`;
    res.json(rows.map(r => ({
      id:         r.order_id,
      timestamp:  Number(r.timestamp),
      items:      JSON.parse(r.items),
      total:      r.total,
      isManual:   r.is_manual === true,
      manualNote: r.manual_note ?? undefined,
    })));
  } catch (err) { next(err); }
});

app.post('/api/orders', requireAuth, async (req, res, next) => {
  try {
    const { id, timestamp, items, total, isManual, manualNote } = req.body ?? {};
    if (!id || !timestamp || total == null) {
      return res.status(400).json({ error: 'Chybí povinná pole (id, timestamp, total)' });
    }
    await sql`
      INSERT INTO orders (order_id, timestamp, items, total, is_manual, manual_note)
      VALUES (
        ${String(id)},
        ${Number(timestamp)},
        ${JSON.stringify(Array.isArray(items) ? items : [])},
        ${Number(total)},
        ${isManual ? true : false},
        ${manualNote ? String(manualNote) : null}
      )
    `;
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({ error: 'Objednávka s tímto ID již existuje' });
    }
    next(err);
  }
});

app.patch('/api/orders/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { total, manualNote } = req.body ?? {};
    if (typeof total !== 'number' || total < 0) {
      return res.status(400).json({ error: 'Neplatná částka' });
    }
    const [row] = await sql`
      UPDATE orders
      SET total = ${Number(total)}, manual_note = ${manualNote ? String(manualNote) : null}
      WHERE order_id = ${id}
      RETURNING id
    `;
    if (!row) return res.status(404).json({ error: 'Objednávka nenalezena' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

app.delete('/api/orders/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [row] = await sql`DELETE FROM orders WHERE order_id = ${id} RETURNING id`;
    if (!row) return res.status(404).json({ error: 'Objednávka nenalezena' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Interní chyba serveru' });
});

// ── Serve built frontend in production (local node only, not Vercel) ──────────
if (IS_PROD && !process.env.VERCEL && fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false }));
  app.use((_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
}

// ── Start server (skipped on Vercel — Vercel imports the app directly) ────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`POS server → http://localhost:${PORT}  [${IS_PROD ? 'production' : 'development'}]`);
  });
}

export default app;
