const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const { Pool } = require('pg');
const { requireAdmin, requireAdminOrValidBooking } = require('../middleware/access');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'smelite_hajj',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

const MANAGEMENT_PHONE = '8801867666888';

// BulkSMSBD sender
async function sendBulkSMS(apiKey, senderId, phone, message) {
  try {
    let formatted = phone.replace(/[^0-9]/g, '');
    if (formatted.startsWith('0')) formatted = '880' + formatted.substring(1);
    else if (!formatted.startsWith('880')) formatted = '880' + formatted;

    const url = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${formatted}&senderid=${senderId}&message=${encodeURIComponent(message)}`;
    const response = await fetch(url);
    const text = await response.text();
    return { success: response.ok, response: text };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Send email via SMTP
async function sendEmail(config, to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: config.smtp_port,
    secure: config.smtp_port === 465,
    auth: { user: config.smtp_user, pass: config.smtp_password },
  });

  await transporter.sendMail({
    from: `"${config.from_name}" <${config.from_email}>`,
    to,
    subject,
    html,
  });
}

// POST /api/notifications/send-booking
router.post('/send-booking', requireAdminOrValidBooking, async (req, res) => {
  try {
    const { bookingId, notificationType = 'booking_confirmed', rejectionReason } = req.body;

    // Fetch booking
    const { rows: [booking] } = await pool.query(
      `SELECT b.*, p.title as pkg_title, p.duration_days, p.type as pkg_type
       FROM bookings b JOIN packages p ON b.package_id = p.id WHERE b.id = $1`,
      [bookingId]
    );
    if (!booking) throw new Error('Booking not found');

    const customerName = booking.guest_name || 'Customer';
    const customerPhone = booking.guest_phone;
    const customerEmail = booking.guest_email;

    // Get notification settings
    const { rows: smsSettings } = await pool.query(
      `SELECT config FROM notification_settings WHERE setting_type = 'sms' AND is_enabled = true LIMIT 1`
    );
    const { rows: emailSettings } = await pool.query(
      `SELECT config FROM notification_settings WHERE setting_type = 'email' AND is_enabled = true LIMIT 1`
    );

    const results = { sms: null, email: null, managementSms: null };

    // Send SMS
    if (smsSettings[0] && customerPhone) {
      const smsConfig = smsSettings[0].config;
      const message = `Dear ${customerName}, your booking for ${booking.pkg_title} is confirmed! Booking ID: ${booking.id.slice(0, 8).toUpperCase()}. Total: ৳${booking.total_price}. - S M Elite Hajj Limited`;
      results.sms = await sendBulkSMS(smsConfig.api_key, smsConfig.sender_id, customerPhone, message);

      // Management SMS (only for new bookings)
      if (notificationType === 'booking_confirmed') {
        const mgmtMsg = `NEW BOOKING! Customer: ${customerName}, Phone: ${customerPhone}, Package: ${booking.pkg_title}, Amount: ৳${booking.total_price}, ID: ${booking.id.slice(0, 8).toUpperCase()}`;
        results.managementSms = await sendBulkSMS(smsConfig.api_key, smsConfig.sender_id, MANAGEMENT_PHONE, mgmtMsg);
      }
    }

    // Send Email
    if (emailSettings[0] && customerEmail) {
      const emailConfig = emailSettings[0].config;
      try {
        await sendEmail(emailConfig, customerEmail, `Booking Confirmation - ${booking.pkg_title}`,
          `<h1>Booking Confirmed!</h1><p>Dear ${customerName}, your booking ID ${booking.id.slice(0, 8).toUpperCase()} is confirmed.</p>`
        );
        results.email = { success: true };
      } catch (err) {
        results.email = { success: false, error: err.message };
      }
    }

    // Log notification
    await pool.query(
      `INSERT INTO notification_logs (booking_id, notification_type, recipient, status)
       VALUES ($1, $2, $3, $4)`,
      [bookingId, notificationType, customerPhone || customerEmail || 'unknown', 'sent']
    );

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications/send-air-ticket
router.post('/send-air-ticket', requireAdmin, async (req, res) => {
  try {
    const { bookingId, notificationType } = req.body;
    // Similar logic for air ticket notifications
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications/send-visa
router.post('/send-visa', requireAdmin, async (req, res) => {
  try {
    const { applicationId, notificationType } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications/send-tracking
router.post('/send-tracking', requireAdmin, async (req, res) => {
  try {
    const { bookingId, newStatus } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications/send-whatsapp-test
router.post('/send-whatsapp-test', requireAdmin, async (req, res) => {
  try {
    const { phone, message } = req.body;
    // WhatsApp Business API logic
    res.json({ success: true, message: 'WhatsApp test - configure API credentials' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
