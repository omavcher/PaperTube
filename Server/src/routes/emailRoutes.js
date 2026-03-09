// routes/emailRoutes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuth");
const emailController = require("../controllers/emailController");

// ─── USER ROUTES (requires normal auth) ──────────────────────────────────────
// Resend invoice to the logged-in user's email
router.post("/resend-invoice", authMiddleware, emailController.resendInvoice);

// ─── ADMIN ROUTES (requires admin auth) ──────────────────────────────────────

// Email logs & monitoring
router.get("/admin/logs", adminAuth, emailController.getEmailLogs);
router.get("/admin/stats", adminAuth, emailController.getEmailStats);
router.delete("/admin/logs/:id", adminAuth, emailController.deleteEmailLog);

// Test connection
router.post("/admin/test", adminAuth, emailController.testEmailConnection);

// One-off email to a specific user
router.post("/admin/send-to-user", adminAuth, emailController.sendEmailToUser);

// Bulk marketing campaigns
router.post("/admin/campaign", adminAuth, emailController.sendBulkCampaign);

// Automated triggers
router.post("/admin/trigger/expiry-warnings", adminAuth, emailController.triggerExpiryEmails);
router.post("/admin/trigger/low-tokens", adminAuth, emailController.triggerLowTokenEmails);

// Admin alerts
router.post("/admin/alert", adminAuth, emailController.sendAdminAlertEmail);

module.exports = router;
