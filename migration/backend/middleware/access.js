const jwt = require('jsonwebtoken');
const { pool } = require('../api/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

/** Tables that must never be exposed via generic REST */
const BLOCKED_TABLES = new Set(['users', 'user_roles', 'schema_migrations']);

/** Public website content — read without login */
const PUBLIC_READ_TABLES = new Set([
  'packages', 'services', 'menu_items', 'hero_content', 'site_settings',
  'team_members', 'testimonials', 'faq_items', 'gallery_images', 'gallery_settings',
  'gallery_videos', 'footer_content', 'notices', 'section_settings', 'blog_posts',
  'blog_categories', 'hotels', 'visa_countries', 'legal_pages', 'social_networks',
  'translations', 'frontend_sections', 'frontend_section_items', 'contact_info',
  'about_content', 'terminal_content', 'theme_settings', 'office_locations',
  'payment_methods',
]);

/** Logged-in customers — read their own data (app must filter by user/id) */
const AUTH_READ_TABLES = new Set([
  'bookings', 'profiles', 'visa_applications', 'transactions',
  'emi_installments', 'air_ticket_bookings', 'hotel_bookings',
]);

/** Guest/customer submissions — insert without admin login */
const PUBLIC_INSERT_TABLES = new Set([
  'bookings', 'page_visits', 'leads', 'visa_applications', 'emi_installments',
  'group_inquiries', 'air_ticket_bookings', 'hotel_bookings', 'transactions',
  'booking_documents', 'webinar_registrations',
]);

/** Anonymous PATCH allowed only for these columns */
const PUBLIC_PATCH_COLUMNS = {
  bookings: new Set(['bank_transfer_screenshot_url']),
};

const SENSITIVE_STRIP_COLUMNS = {
  payment_methods: ['credentials'],
  notification_settings: ['config'],
};

function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.replace('Bearer ', '');
}

async function optionalAuth(req, _res, next) {
  const token = getBearerToken(req);
  if (!token) {
    req.user = null;
    req.userRole = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    const { rows } = await pool.query('SELECT role FROM profiles WHERE id = $1', [decoded.id]);
    req.userRole = rows[0]?.role || null;
  } catch {
    req.user = null;
    req.userRole = null;
  }
  next();
}

async function loadUserRole(req) {
  if (req.userRole !== undefined && req.userRole !== null) return req.userRole;
  if (!req.user?.id) return null;
  const { rows } = await pool.query('SELECT role FROM profiles WHERE id = $1', [req.user.id]);
  req.userRole = rows[0]?.role || null;
  return req.userRole;
}

function isAdmin(role) {
  return role === 'admin';
}

function canAccessAdminPanel(role) {
  return role === 'admin' || role === 'viewer';
}

function hasQueryFilter(req) {
  return Object.keys(req.query).some(
    (key) => !['select', 'order', 'limit', 'offset'].includes(key)
  );
}

function allowsPublicBookingRead(req) {
  if (!hasQueryFilter(req)) return false;
  const q = req.query;
  if (q.id || q.or) return true;
  return Object.keys(q).some(
    (key) =>
      key === 'guest_email' ||
      key === 'guest_phone' ||
      key.startsWith('guest_email.') ||
      key.startsWith('guest_phone.')
  );
}

function allowsPublicVisaRead(req) {
  if (!hasQueryFilter(req)) return false;
  const q = req.query;
  return !!(q.id || q.or || q.tracking_id || q.application_number);
}

function allowsPublicBookingPatch(req) {
  if (!hasQueryFilter(req)) return false;
  const body = req.body || {};
  const keys = Object.keys(body);
  if (keys.length === 0) return false;
  const allowed = PUBLIC_PATCH_COLUMNS.bookings;
  return keys.every((key) => allowed.has(key));
}

async function enforceRestAccess(req, res, table, method) {
  if (BLOCKED_TABLES.has(table)) {
    res.status(403).json({ error: 'Table not allowed' });
    return false;
  }

  const role = await loadUserRole(req);
  const admin = isAdmin(role);
  const upperMethod = method.toUpperCase();

  if (upperMethod === 'GET') {
    if (PUBLIC_READ_TABLES.has(table)) return true;

    if (table === 'bookings' && allowsPublicBookingRead(req)) return true;
    if (table === 'visa_applications' && allowsPublicVisaRead(req)) return true;

    if (AUTH_READ_TABLES.has(table) && req.user) return true;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return false;
    }

    if (!canAccessAdminPanel(role)) {
      res.status(403).json({ error: 'Admin access required' });
      return false;
    }

    return true;
  }

  if (upperMethod === 'POST') {
    if (PUBLIC_INSERT_TABLES.has(table)) return true;

    if (table === 'profiles' && req.user) {
      const rows = Array.isArray(req.body) ? req.body : [req.body];
      if (rows.every((row) => row && row.id === req.user.id)) return true;
    }

    if (!req.user || !admin) {
      res.status(admin ? 401 : 403).json({ error: 'Admin access required' });
      return false;
    }
    return true;
  }

  if (upperMethod === 'PATCH') {
    if (table === 'bookings' && !admin && allowsPublicBookingPatch(req)) return true;

    if (table === 'profiles' && req.user && hasQueryFilter(req)) {
      const idVal = req.query['id.eq'] || req.query.id;
      const normalized = String(idVal || '').replace(/^eq\./, '');
      if (normalized === req.user.id) return true;
    }

    if (!req.user || !admin) {
      res.status(!req.user ? 401 : 403).json({ error: 'Admin access required' });
      return false;
    }
    return true;
  }

  if (upperMethod === 'DELETE') {
    if (!req.user || !admin) {
      res.status(!req.user ? 401 : 403).json({ error: 'Admin access required' });
      return false;
    }
    return true;
  }

  res.status(405).json({ error: 'Method not allowed' });
  return false;
}

function sanitizeTableRows(table, rows, isAdmin) {
  if (isAdmin || !Array.isArray(rows)) return rows;

  const strip = SENSITIVE_STRIP_COLUMNS[table];
  if (!strip) return rows;

  return rows.map((row) => {
    const copy = { ...row };
    for (const col of strip) delete copy[col];
    return copy;
  });
}

/** Admin-only middleware for Express routes */
async function requireAdmin(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    const role = await loadUserRole(req);
    if (!isAdmin(role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/** Admin or viewer — read-only admin panel */
async function requireAdminPanel(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    const role = await loadUserRole(req);
    if (!canAccessAdminPanel(role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/** Admin JWT, or a valid bookingId in the request body (guest checkout notifications) */
async function requireAdminOrValidBooking(req, res, next) {
  const token = getBearerToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      const role = await loadUserRole(req);
      if (isAdmin(role)) return next();
    } catch {
      // fall through
    }
  }

  const bookingId = req.body?.bookingId;
  if (bookingId) {
    try {
      const { rows } = await pool.query('SELECT id FROM bookings WHERE id = $1', [bookingId]);
      if (rows[0]) return next();
    } catch {
      // fall through
    }
  }

  return res.status(403).json({ error: 'Forbidden' });
}

const PUBLIC_FUNCTION_NAMES = new Set([
  'payment-sslcommerz',
  'payment-bkash',
  'payment-nagad',
  'payment-installment',
  'create-guest-account',
  'send-booking-notification',
  'send-emi-notification',
  'fb-event',
]);

const ADMIN_FUNCTION_NAMES = new Set([
  'backup-restore',
  'create-admin-user',
  'create-staff-user',
  'create-demo-user',
  'update-user-password',
  'send-whatsapp-test',
  'send-visa-notification',
  'send-tracking-notification',
  'send-air-ticket-notification',
  'emi-reminder',
]);

async function enforceFunctionAccess(req, res, functionName) {
  if (PUBLIC_FUNCTION_NAMES.has(functionName)) return true;

  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return false;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    const role = await loadUserRole(req);

    if (functionName === 'send-welcome-notification') {
      return true;
    }

    if (ADMIN_FUNCTION_NAMES.has(functionName)) {
      if (!isAdmin(role)) {
        res.status(403).json({ error: 'Admin access required' });
        return false;
      }
      return true;
    }

    res.status(403).json({ error: 'Function not allowed' });
    return false;
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return false;
  }
}

function isPublicUploadBucket(bucket) {
  return bucket === 'booking-documents';
}

module.exports = {
  optionalAuth,
  requireAdmin,
  requireAdminPanel,
  requireAdminOrValidBooking,
  enforceRestAccess,
  enforceFunctionAccess,
  sanitizeTableRows,
  isPublicUploadBucket,
  isAdmin,
  loadUserRole,
  PUBLIC_FUNCTION_NAMES,
  ADMIN_FUNCTION_NAMES,
};
