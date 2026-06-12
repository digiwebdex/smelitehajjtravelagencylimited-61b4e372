const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { requireAdmin } = require('../middleware/access');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'smelite_hajj',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

router.use(requireAdmin);

// POST /api/backup-restore/backup
router.post('/backup', async (req, res) => {
  try {
    const { backupType = 'full', tables } = req.body;

    const allTables = tables || [
      'packages', 'bookings', 'customers', 'leads', 'agents',
      'hero_content', 'services', 'testimonials', 'faq_items',
      'team_members', 'gallery_images', 'contact_info', 'menu_items',
      'footer_content', 'notices', 'section_settings', 'site_settings',
      'blog_posts', 'blog_categories', 'hotels', 'visa_countries',
      'notification_settings', 'notification_templates', 'payment_methods',
    ];

    const backupData = {};
    const recordCounts = {};

    for (const table of allTables) {
      try {
        const { rows } = await pool.query(`SELECT * FROM public."${table}"`);
        backupData[table] = rows;
        recordCounts[table] = rows.length;
      } catch (err) {
        console.error(`Error backing up ${table}:`, err.message);
      }
    }

    const backupDir = path.join(__dirname, '..', 'backups');
    fs.mkdirSync(backupDir, { recursive: true });

    const filename = `backup_${backupType}_${Date.now()}.json`;
    const filepath = path.join(backupDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    const fileSize = fs.statSync(filepath).size;

    await pool.query(
      `INSERT INTO backup_history (backup_name, backup_type, file_path, file_size, tables_included, record_counts, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'completed')`,
      [filename, backupType, filepath, fileSize, allTables, JSON.stringify(recordCounts)]
    );

    res.json({ success: true, filename, fileSize, recordCounts, message: 'Backup created' });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Backup failed' });
  }
});

// POST /api/backup-restore/restore
router.post('/restore', async (req, res) => {
  try {
    const { backupId } = req.body;

    const { rows: [backup] } = await pool.query('SELECT * FROM backup_history WHERE id = $1', [backupId]);
    if (!backup) throw new Error('Backup not found');

    const backupData = JSON.parse(fs.readFileSync(backup.file_path, 'utf-8'));

    for (const [table, rows] of Object.entries(backupData)) {
      if (rows.length === 0) continue;

      await pool.query(`DELETE FROM public."${table}"`);

      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`);

        try {
          await pool.query(
            `INSERT INTO public."${table}" (${columns.map((c) => `"${c}"`).join(',')}) VALUES (${placeholders.join(',')})`,
            values
          );
        } catch (err) {
          console.error(`Error restoring row in ${table}:`, err.message);
        }
      }
    }

    res.json({ success: true, message: 'Restore completed' });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ error: 'Restore failed' });
  }
});

module.exports = router;
