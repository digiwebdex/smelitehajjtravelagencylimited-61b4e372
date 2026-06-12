/* CMS allowed REST tables: frontend_sections, frontend_section_items, frontend_cms_history */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const {
  optionalAuth,
  requireAdmin,
  enforceRestAccess,
  enforceFunctionAccess,
  sanitizeTableRows,
  isPublicUploadBucket,
  isAdmin,
  loadUserRole,
} = require('./middleware/access');

const app = express();
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'production') {
  const secret = process.env.JWT_SECRET || '';
  if (!secret || secret === 'your-super-secret-key-change-this') {
    console.error('FATAL: Set a strong JWT_SECRET in production');
    process.exit(1);
  }
}

const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'https://smelitehajj.com,https://www.smelitehajj.com')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'smelite_hajj',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Export pool for use in routes
module.exports.pool = pool;

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin || CORS_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// GENERIC CRUD API (replaces Supabase PostgREST)
// ============================================================

// GET /api/rest/:table - Select rows with filters

// Patched Supabase-compatible REST GET endpoint
const __restGetColumnsCache = new Map();

async function __restGetTableColumns(table) {
  if (__restGetColumnsCache.has(table)) return __restGetColumnsCache.get(table);

  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );

  const cols = new Set(result.rows.map(r => r.column_name));
  __restGetColumnsCache.set(table, cols);
  return cols;
}

function __restQuoteIdent(name) {
  return '"' + String(name).replace(/"/g, '""') + '"';
}


function __smeLooksLikeUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function __restIsAllowedTable(table) {
  // Allow existing-style public app tables requested by the admin/frontend.
  // SQL injection is still blocked because table names must be valid identifiers
  // and all SQL uses quoted identifiers.
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(String(table || ''))) {
    return false;
  }

  // Keep dangerous/internal names blocked.
  const blocked = new Set([
    'pg_stat_statements',
    'pg_user',
    'pg_shadow',
    'information_schema',
    'schema_migrations'
  ]);

  return !blocked.has(table);
}

function __restParseFilter(rawValue) {
  if (typeof rawValue !== 'string') {
    return { op: 'eq', value: rawValue };
  }

  const idx = rawValue.indexOf('.');
  if (idx === -1) {
    return { op: 'eq', value: rawValue };
  }

  const op = rawValue.slice(0, idx);
  const value = rawValue.slice(idx + 1);
  const allowedOps = new Set(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in']);

  if (!allowedOps.has(op)) {
    return { op: 'eq', value: rawValue };
  }

  return { op, value };
}

function __restBuildCondition(col, rawValue, params, columns) {
  if (!columns.has(col)) return null;

  const parsed = __restParseFilter(rawValue);
  const op = parsed.op;
  const value = parsed.value;

  if (op === 'is') {
    if (String(value).toLowerCase() === 'null') {
      return `${__restQuoteIdent(col)} IS NULL`;
    }
    if (String(value).toLowerCase() === 'not.null') {
      return `${__restQuoteIdent(col)} IS NOT NULL`;
    }
    return null;
  }

  if (op === 'in') {
    let values = String(value).trim();
    values = values.replace(/^\(/, '').replace(/\)$/, '');
    const list = values.split(',').map(v => v.trim()).filter(Boolean);

    if (list.length === 0) return null;

    const placeholders = list.map(v => {
      params.push(v);
      return `$${params.length}`;
    });

    return `${__restQuoteIdent(col)} IN (${placeholders.join(', ')})`;
  }

  params.push(value);
  const ph = `$${params.length}`;

  switch (op) {
    case 'eq':
      return `${__restQuoteIdent(col)} = ${ph}`;
    case 'neq':
      return `${__restQuoteIdent(col)} <> ${ph}`;
    case 'gt':
      return `${__restQuoteIdent(col)} > ${ph}`;
    case 'gte':
      return `${__restQuoteIdent(col)} >= ${ph}`;
    case 'lt':
      return `${__restQuoteIdent(col)} < ${ph}`;
    case 'lte':
      return `${__restQuoteIdent(col)} <= ${ph}`;
    case 'like':
      return `${__restQuoteIdent(col)} LIKE ${ph}`;
    case 'ilike':
      return `${__restQuoteIdent(col)} ILIKE ${ph}`;
    default:
      return `${__restQuoteIdent(col)} = ${ph}`;
  }
}

function __restBuildOrCondition(orValue, params, columns) {
  let value = String(orValue || '').trim();
  value = value.replace(/^\(/, '').replace(/\)$/, '');

  if (!value) return null;

  const parts = value.split(',').map(x => x.trim()).filter(Boolean);
  const conditions = [];

  for (const part of parts) {
    const bits = part.split('.');
    if (bits.length < 3) continue;

    const col = bits[0];
    const op = bits[1];
    const rest = bits.slice(2).join('.');

    const condition = __restBuildCondition(col, `${op}.${rest}`, params, columns);
    if (condition) conditions.push(condition);
  }

  if (conditions.length === 0) return null;
  return '(' + conditions.join(' OR ') + ')';
}

function __restParseOrder(orderRaw, columns) {
  if (!orderRaw) return '';

  const parts = String(orderRaw).split(',').map(x => x.trim()).filter(Boolean);
  const out = [];

  for (const part of parts) {
    const bits = part.split('.');
    const col = bits[0];

    if (!columns.has(col)) continue;

    let sql = __restQuoteIdent(col);
    sql += bits.includes('desc') ? ' DESC' : ' ASC';

    if (bits.includes('nullsfirst')) sql += ' NULLS FIRST';
    if (bits.includes('nullslast')) sql += ' NULLS LAST';

    out.push(sql);
  }

  return out.length ? ` ORDER BY ${out.join(', ')}` : '';
}

function __restParseSelect(selectRaw, columns) {
  if (!selectRaw || selectRaw === '*') return '*';

  const raw = String(selectRaw);

  // Relationship select like packages(...), profiles(...), etc.
  // Generic backend cannot join like Supabase, so safely return *.
  if (raw.includes('(') || raw.includes(')')) return '*';

  const requested = raw
    .split(',')
    .map(x => x.trim())
    .filter(Boolean)
    .filter(col => columns.has(col));

  if (requested.length === 0) return '*';

  return requested.map(__restQuoteIdent).join(', ');
}

app.get('/api/rest/:table', optionalAuth, async (req, res) => {
  try {
    const { table } = req.params;

    if (!__restIsAllowedTable(table)) {
      return res.status(403).json({ error: 'Table not allowed' });
    }

    if (!(await enforceRestAccess(req, res, table, 'GET'))) return;

    const columns = await __restGetTableColumns(table);

    if (!columns || columns.size === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const params = [];
    const where = [];

    for (const [key, value] of Object.entries(req.query)) {
      if (['select', 'order', 'limit', 'offset'].includes(key)) continue;

      if (key === 'or') {
        const condition = __restBuildOrCondition(value, params, columns);
        if (condition) where.push(condition);
        continue;
      }

      // Supports created_at.gte=2026-01-01
      if (key.includes('.')) {
        const [col, op] = key.split('.', 2);
        const condition = __restBuildCondition(col, `${op}.${value}`, params, columns);
        if (condition) where.push(condition);
        continue;
      }

      // Supports created_at=gte.2026-01-01 and is_active=eq.true
      const condition = __restBuildCondition(key, value, params, columns);
      if (condition) where.push(condition);
    }

    const safeSelectColumns = new Set(columns);
    if (table === 'users') safeSelectColumns.delete('encrypted_password');
    const selectSql = __restParseSelect(req.query.select, safeSelectColumns);
    const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const orderSql = __restParseOrder(req.query.order, columns);

    let limitSql = '';
    if (req.query.limit && /^\d+$/.test(String(req.query.limit))) {
      limitSql = ` LIMIT ${Math.min(parseInt(req.query.limit, 10), 1000)}`;
    }

    let offsetSql = '';
    if (req.query.offset && /^\d+$/.test(String(req.query.offset))) {
      offsetSql = ` OFFSET ${parseInt(req.query.offset, 10)}`;
    }

    const sql = `SELECT ${selectSql} FROM public.${__restQuoteIdent(table)}${whereSql}${orderSql}${limitSql}${offsetSql}`;
    const result = await pool.query(sql, params);
    const role = await loadUserRole(req);

    res.json(sanitizeTableRows(table, result.rows, isAdmin(role)));
  } catch (error) {
    console.error('GET error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
});


// POST /api/rest/:table - Insert row(s) / Upsert

app.post('/api/rest/:table', optionalAuth, async (req, res) => {
  try {
    const { table } = req.params;

    if (!__restIsAllowedTable(table)) {
      return res.status(403).json({ error: 'Table not allowed' });
    }

    if (!(await enforceRestAccess(req, res, table, 'POST'))) return;

    const columns = await __restGetTableColumns(table);

    if (!columns || columns.size === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const rowsToInsert = Array.isArray(req.body) ? req.body : [req.body];

    if (!rowsToInsert.length || !rowsToInsert[0] || typeof rowsToInsert[0] !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const insertedRows = [];

    for (const inputRow of rowsToInsert) {
      const allowedEntries = Object.entries(inputRow || {}).filter(([key]) => columns.has(key));

      if (allowedEntries.length === 0) {
        return res.status(400).json({
          error: 'No valid columns provided',
          valid_columns: Array.from(columns).sort()
        });
      }

      const keys = allowedEntries.map(([key]) => key);
      const values = allowedEntries.map(([, value]) => value);

      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const cols = keys.map(__restQuoteIdent).join(', ');

      const sql = `INSERT INTO public.${__restQuoteIdent(table)} (${cols}) VALUES (${placeholders}) RETURNING *`;
      const result = await pool.query(sql, values);

      insertedRows.push(result.rows[0]);
    }

    res.status(201).json(Array.isArray(req.body) ? insertedRows : insertedRows[0]);
  } catch (error) {
    console.error('POST error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
});


// PATCH /api/rest/:table - Update rows

app.patch('/api/rest/:table', optionalAuth, async (req, res) => {
  try {
    const { table } = req.params;

    if (!__restIsAllowedTable(table)) {
      return res.status(403).json({ error: 'Table not allowed' });
    }

    if (!(await enforceRestAccess(req, res, table, 'PATCH'))) return;

    const columns = await __restGetTableColumns(table);

    if (!columns || columns.size === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const params = [];
    const where = [];

    for (const [key, value] of Object.entries(req.query)) {
      if (['select', 'order', 'limit', 'offset'].includes(key)) continue;

      if (key.includes('.')) {
        const [col, op] = key.split('.', 2);
        const condition = __restBuildCondition(col, `${op}.${value}`, params, columns);
        if (condition) where.push(condition);
        continue;
      }

      const condition = __restBuildCondition(key, value, params, columns);
      if (condition) where.push(condition);
    }

    if (where.length === 0) {
      return res.status(400).json({ error: 'PATCH requires a valid filter' });
    }

    const allowedEntries = Object.entries(req.body || {}).filter(([key]) => columns.has(key));

    if (allowedEntries.length === 0) {
      return res.status(400).json({ error: 'No valid columns provided' });
    }

    const setParts = [];

    for (const [key, value] of allowedEntries) {
      params.push(value);
      setParts.push(`${__restQuoteIdent(key)} = $${params.length}`);
    }

    const sql = `UPDATE public.${__restQuoteIdent(table)} SET ${setParts.join(', ')} WHERE ${where.join(' AND ')} RETURNING *`;
    const result = await pool.query(sql, params);

    res.json(result.rows);
  } catch (error) {
    console.error('PATCH error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
});


// DELETE /api/rest/:table - Delete rows

app.delete('/api/rest/:table', optionalAuth, async (req, res) => {
  try {
    const { table } = req.params;

    if (!__restIsAllowedTable(table)) {
      return res.status(403).json({ error: 'Table not allowed' });
    }

    if (!(await enforceRestAccess(req, res, table, 'DELETE'))) return;

    const columns = await __restGetTableColumns(table);

    if (!columns || columns.size === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const params = [];
    const where = [];

    for (const [key, value] of Object.entries(req.query)) {
      if (['select', 'order', 'limit', 'offset'].includes(key)) continue;

      if (key.includes('.')) {
        const [col, op] = key.split('.', 2);
        const condition = __restBuildCondition(col, `${op}.${value}`, params, columns);
        if (condition) where.push(condition);
        continue;
      }

      const condition = __restBuildCondition(key, value, params, columns);
      if (condition) where.push(condition);
    }

    if (where.length === 0) {
      return res.status(400).json({ error: 'DELETE requires a valid filter' });
    }

    const sql = `DELETE FROM public.${__restQuoteIdent(table)} WHERE ${where.join(' AND ')} RETURNING *`;
    const result = await pool.query(sql, params);

    res.json(result.rows);
  } catch (error) {
    console.error('DELETE error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
});


// RPC endpoint (call database functions) — admin only
app.post('/api/rpc/:functionName', requireAdmin, async (req, res) => {
  try {
    const { functionName } = req.params;

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(functionName)) {
      return res.status(400).json({ error: 'Invalid function name' });
    }
    const params = req.body;
    const paramKeys = Object.keys(params);
    
    if (paramKeys.length === 0) {
      const result = await pool.query(`SELECT public."${functionName}"() as result`);
      res.json(result.rows[0]?.result);
    } else {
      const values = Object.values(params);
      const placeholders = paramKeys.map((k, i) => `$${i + 1}::text`);
      const result = await pool.query(
        `SELECT public."${functionName}"(${placeholders.join(',')}) as result`,
        values
      );
      res.json(result.rows[0]?.result);
    }
  } catch (error) {
    console.error('RPC error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
});

// ============================================================
// EDGE FUNCTION REPLACEMENTS
// ============================================================

// Import route modules
const authRoutes = require('./api/auth');
const adminRoutes = require('./api/admin-users');
const paymentSSLRoutes = require('./api/payment-sslcommerz');
const paymentBkashRoutes = require('./api/payment-bkash');
const paymentNagadRoutes = require('./api/payment-nagad');
const notificationRoutes = require('./api/notifications');
const backupRoutes = require('./api/backup-restore');

app.use('/api/auth', authRoutes);
app.use('/api/admin-users', adminRoutes);
app.use('/api/payment-sslcommerz', paymentSSLRoutes);
app.use('/api/payment-bkash', paymentBkashRoutes);
app.use('/api/payment-nagad', paymentNagadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/backup-restore', backupRoutes);

// Functions proxy - replaces Supabase Edge Functions
// Maps supabase.functions.invoke('name') -> /api/functions/name
app.post('/api/functions/:name', optionalAuth, async (req, res) => {
  const { name } = req.params;

  if (!(await enforceFunctionAccess(req, res, name))) return;

  const routeMap = {
    'payment-sslcommerz': '/api/payment-sslcommerz',
    'payment-bkash': '/api/payment-bkash',
    'payment-nagad': '/api/payment-nagad',
    'payment-installment': '/api/payment-sslcommerz',
    'backup-restore': '/api/backup-restore/backup',
    'send-booking-notification': '/api/notifications/send-booking',
    'send-air-ticket-notification': '/api/notifications/send-air-ticket',
    'send-visa-notification': '/api/notifications/send-visa',
    'send-emi-notification': '/api/notifications/send-booking',
    'send-tracking-notification': '/api/notifications/send-tracking',
    'send-welcome-notification': '/api/notifications/send-booking',
    'send-whatsapp-test': '/api/notifications/send-whatsapp-test',
    'emi-reminder': '/api/notifications/send-booking',
    'fb-event': '/api/notifications/send-booking',
    'create-guest-account': '/api/auth/signup',
    'create-demo-user': '/api/admin-users/create-demo',
    'create-admin-user': '/api/admin-users/create-admin',
    'create-staff-user': '/api/admin-users/create-staff',
    'update-user-password': '/api/admin-users/update-password',
  };

  const targetRoute = routeMap[name];
  if (!targetRoute) {
    console.warn(`Unknown function called: ${name}`);
    return res.status(404).json({ error: `Function ${name} not found` });
  }

  try {
    let targetUrl = `http://127.0.0.1:${PORT}${targetRoute}`;

    if (['payment-sslcommerz', 'payment-bkash', 'payment-nagad', 'payment-installment'].includes(name)) {
      const action = req.body?.action || 'initiate';
      targetUrl = `http://127.0.0.1:${PORT}${routeMap[name]}/${action}`;
    }

    if (name === 'backup-restore') {
      const action = req.body?.action;
      if (action === 'restore_backup') targetUrl = `http://127.0.0.1:${PORT}/api/backup-restore/restore`;
      else targetUrl = `http://127.0.0.1:${PORT}/api/backup-restore/backup`;
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`Functions proxy error for ${name}:`, error);
    res.status(500).json({ error: 'Function request failed' });
  }
});

// File upload endpoint (replaces Supabase Storage)
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bucket = req.params.bucket || 'uploads';
    const dir = path.join(__dirname, 'uploads', bucket);
    require('fs').mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

function uploadAuth(req, res, next) {
  const bucket = req.params.bucket || req.body?.bucket;
  if (isPublicUploadBucket(bucket)) return next();
  return requireAdmin(req, res, next);
}

app.post('/api/storage/:bucket/upload', uploadAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.params.bucket}/${req.file.filename}`;
  res.json({
    path: `${req.params.bucket}/${req.file.filename}`,
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
  });
});

// Start server

// === VPS REAL FILE UPLOAD ENDPOINT ===
const __vpsFs = require('fs');
const __vpsPath = require('path');
const __vpsMulter = require('multer');

const __vpsUploadRoot = __vpsPath.join(__dirname, 'uploads');
__vpsFs.mkdirSync(__vpsUploadRoot, { recursive: true });

function __vpsSafePart(value, fallback) {
  return String(value || fallback || 'misc')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/\.+/g, '.')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || fallback || 'misc';
}

const __vpsStorage = __vpsMulter.diskStorage({
  destination: function (req, file, cb) {
    const bucket = __vpsSafePart(req.params.bucket || req.body.bucket || 'misc', 'misc');
    const dir = __vpsPath.join(__vpsUploadRoot, bucket);
    __vpsFs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = (__vpsPath.extname(file.originalname || '') || '.webp').toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  }
});

const __vpsUploader = __vpsMulter({
  storage: __vpsStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const ok = /^image\/(jpeg|jpg|png|webp|gif|svg\+xml)$/.test(file.mimetype || '');
    cb(ok ? null : new Error('Only image uploads are allowed'), ok);
  }
});

app.post(['/api/upload/:bucket', '/api/storage/upload/:bucket', '/upload/:bucket'], uploadAuth, __vpsUploader.single('file'), function (req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const bucket = __vpsSafePart(req.params.bucket || req.body.bucket || 'misc', 'misc');
  const url = `/uploads/${bucket}/${req.file.filename}`;

  res.json({
    path: url,
    url,
    publicUrl: url,
    filename: req.file.filename,
    bucket
  });
});



// === VPS NESTED FILE UPLOAD ENDPOINT FOR ADMIN UPLOADS ===
const __nestedFs = require('fs');
const __nestedPath = require('path');
const __nestedMulter = require('multer');

function __nestedSafePart(value, fallback) {
  return String(value || fallback || 'file')
    .replace(/\\/g, '/')
    .split('/')
    .map(part => part.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/\.+/g, '.').replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .join('/');
}

function __nestedSafeName(value, fallback) {
  return String(value || fallback || 'file.webp')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/\.+/g, '.')
    .replace(/^-+|-+$/g, '') || fallback || 'file.webp';
}

const __nestedUpload = __nestedMulter({
  storage: __nestedMulter.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const ok = /^image\/(jpeg|jpg|png|webp|gif|svg\+xml)$/.test(file.mimetype || '');
    cb(ok ? null : new Error('Only image uploads are allowed'), ok);
  }
});

app.post(['/api/vps-upload/:bucket', '/vps-upload/:bucket'], uploadAuth, __nestedUpload.single('file'), function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const bucket = __nestedSafeName(req.params.bucket || req.body.bucket || 'admin-uploads', 'admin-uploads');

    let requestedPath = String(req.body.path || req.query.path || req.file.originalname || '');
    requestedPath = requestedPath.replace(/^\/+/, '').replace(/^uploads\//, '').replace(new RegExp('^' + bucket + '/'), '');

    if (!requestedPath || requestedPath === 'undefined' || requestedPath === 'null') {
      const ext = (__nestedPath.extname(req.file.originalname || '') || '.webp').toLowerCase();
      requestedPath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    }

    const safePath = __nestedSafePart(requestedPath, `file-${Date.now()}.webp`);
    const parts = safePath.split('/');
    const filename = __nestedSafeName(parts.pop(), `file-${Date.now()}.webp`);
    const subdir = parts.join('/');

    const uploadRoot = __nestedPath.join(__dirname, 'uploads');
    const targetDir = __nestedPath.join(uploadRoot, bucket, subdir);
    __nestedFs.mkdirSync(targetDir, { recursive: true });

    const targetFile = __nestedPath.join(targetDir, filename);
    __nestedFs.writeFileSync(targetFile, req.file.buffer);

    const relativePath = subdir ? `${subdir}/${filename}` : filename;
    const url = `/uploads/${bucket}/${relativePath}`;

    res.json({
      path: relativePath,
      fullPath: `${bucket}/${relativePath}`,
      url,
      publicUrl: url,
      bucket,
      filename
    });
  } catch (error) {
    console.error('VPS upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});


app.listen(PORT, process.env.HOST || '127.0.0.1', () => {
  console.log(`SM Elite Hajj Backend running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
