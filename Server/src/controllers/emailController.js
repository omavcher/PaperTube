/**
 * emailController.js
 *
 * Admin-only endpoints for:
 *  - Viewing email logs / stats
 *  - Sending bulk marketing campaigns
 *  - Sending one-off emails to specific users
 *  - Triggering transactional emails manually (subscription expiry, low tokens, etc.)
 *
 * User endpoint:
 *  - POST /api/email/resend-invoice  → user resends their own invoice
 */

const User = require("../models/User");
const EmailLog = require("../models/EmailLog");
const emailService = require("../utils/emailService");

// ─── ADMIN: Get email logs with pagination & filters ─────────────────────────
exports.getEmailLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 30,
      status,
      templateType,
      search,
      startDate,
      endDate,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (templateType) filter.templateType = templateType;
    if (search) filter.$or = [{ to: new RegExp(search, "i") }, { subject: new RegExp(search, "i") }];
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      EmailLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      EmailLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("❌ getEmailLogs:", err);
    res.status(500).json({ success: false, message: "Failed to fetch email logs" });
  }
};

// ─── ADMIN: Email stats overview ─────────────────────────────────────────────
exports.getEmailStats = async (req, res) => {
  try {
    const [total, sent, failed, pending, byType] = await Promise.all([
      EmailLog.countDocuments(),
      EmailLog.countDocuments({ status: "sent" }),
      EmailLog.countDocuments({ status: "failed" }),
      EmailLog.countDocuments({ status: "pending" }),
      EmailLog.aggregate([
        { $group: { _id: "$templateType", count: { $sum: 1 }, sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Recent 7 days trend
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trend = await EmailLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: { total, sent, failed, pending, deliveryRate: total > 0 ? ((sent / total) * 100).toFixed(1) : "0" },
        byType,
        trend,
      },
    });
  } catch (err) {
    console.error("❌ getEmailStats:", err);
    res.status(500).json({ success: false, message: "Failed to fetch email stats" });
  }
};

// ─── ADMIN: Delete email log ──────────────────────────────────────────────────
exports.deleteEmailLog = async (req, res) => {
  try {
    await EmailLog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Log deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete log" });
  }
};

// ─── ADMIN: Send one-off email to a specific user ────────────────────────────
exports.sendEmailToUser = async (req, res) => {
  try {
    const { userId, subject, headline, subheadline, body, ctaText, ctaUrl, footerNote, badgeText, badgeType } = req.body;

    if (!userId || !subject || !body) {
      return res.status(400).json({ success: false, message: "userId, subject, and body are required" });
    }

    const user = await User.findById(userId).select("name email");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const result = await emailService.sendMarketing({
      to: user.email,
      toName: user.name,
      subject,
      headline: headline || subject,
      subheadline,
      body,
      ctaText,
      ctaUrl,
      footerNote,
      badgeText,
      badgeType,
    });

    res.json({ success: result.success, message: result.success ? "Email sent" : "Email failed", result });
  } catch (err) {
    console.error("❌ sendEmailToUser:", err);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
};

// ─── ADMIN: Send bulk marketing campaign ─────────────────────────────────────
exports.sendBulkCampaign = async (req, res) => {
  try {
    const {
      targetGroup = "all", // all | subscribers | free | custom
      customUserIds,
      subject,
      headline,
      subheadline,
      body,
      ctaText,
      ctaUrl,
      footerNote,
      badgeText,
      badgeType,
    } = req.body;

    if (!subject || !headline || !body) {
      return res.status(400).json({ success: false, message: "subject, headline, body required" });
    }

    let users = [];

    if (targetGroup === "all") {
      users = await User.find({}).select("name email").lean();
    } else if (targetGroup === "subscribers") {
      users = await User.find({ "membership.isActive": true }).select("name email").lean();
    } else if (targetGroup === "free") {
      users = await User.find({ $or: [{ "membership.isActive": false }, { membership: { $exists: false } }] }).select("name email").lean();
    } else if (targetGroup === "custom" && Array.isArray(customUserIds)) {
      users = await User.find({ _id: { $in: customUserIds } }).select("name email").lean();
    } else {
      return res.status(400).json({ success: false, message: "Invalid targetGroup or missing customUserIds" });
    }

    if (users.length === 0) {
      return res.json({ success: true, message: "No users matched the target group", sent: 0 });
    }

    // Respond immediately — fire bulk email in background
    res.json({
      success: true,
      message: `Campaign started for ${users.length} users. Emails will be sent in background.`,
      totalRecipients: users.length,
    });

    // Background send (no await — response already sent)
    emailService
      .sendBulkMarketing({
        recipients: users.map((u) => ({ email: u.email, name: u.name })),
        subject,
        headline,
        subheadline,
        body,
        ctaText,
        ctaUrl,
        footerNote,
        badgeText,
        badgeType,
      })
      .then((results) => {
        const sent = results.filter((r) => r.success).length;
        const failed = results.length - sent;
        console.log(`📊 [Campaign] Done: ${sent} sent, ${failed} failed`);
      })
      .catch((e) => console.error("❌ [Campaign] Error:", e.message));
  } catch (err) {
    console.error("❌ sendBulkCampaign:", err);
    res.status(500).json({ success: false, message: "Failed to start campaign" });
  }
};

// ─── ADMIN: Trigger subscription expiry emails for expiring soon ──────────────
exports.triggerExpiryEmails = async (req, res) => {
  try {
    const { daysThreshold = 3 } = req.body;
    const now = new Date();
    const cutoff = new Date(now.getTime() + parseInt(daysThreshold) * 24 * 60 * 60 * 1000);

    const users = await User.find({
      "membership.isActive": true,
      "membership.expiresAt": { $gte: now, $lte: cutoff },
    }).select("name email membership").lean();

    res.json({
      success: true,
      message: `Sending expiry warnings to ${users.length} users...`,
      count: users.length,
    });

    // Background
    for (const user of users) {
      const daysLeft = Math.ceil((new Date(user.membership.expiresAt) - now) / (1000 * 60 * 60 * 24));
      await emailService.sendSubscriptionExpiring(user, daysLeft).catch(() => {});
      await new Promise((r) => setTimeout(r, 200));
    }
  } catch (err) {
    console.error("❌ triggerExpiryEmails:", err);
    res.status(500).json({ success: false, message: "Failed to trigger expiry emails" });
  }
};

// ─── ADMIN: Trigger low-token emails ─────────────────────────────────────────
exports.triggerLowTokenEmails = async (req, res) => {
  try {
    const { threshold = 3 } = req.body;

    const users = await User.find({
      "membership.isActive": { $ne: true },
      $or: [{ token: { $lte: parseInt(threshold) } }, { tokens: { $lte: parseInt(threshold) } }],
    }).select("name email token tokens").lean();

    res.json({
      success: true,
      message: `Sending low token alerts to ${users.length} users...`,
      count: users.length,
    });

    for (const user of users) {
      await emailService.sendLowTokenAlert(user).catch(() => {});
      await new Promise((r) => setTimeout(r, 200));
    }
  } catch (err) {
    console.error("❌ triggerLowTokenEmails:", err);
    res.status(500).json({ success: false, message: "Failed to trigger low token emails" });
  }
};

// ─── ADMIN: Send admin alert email ───────────────────────────────────────────
exports.sendAdminAlertEmail = async (req, res) => {
  try {
    const { alertType, message, data } = req.body;
    if (!alertType || !message) {
      return res.status(400).json({ success: false, message: "alertType and message required" });
    }
    const result = await emailService.sendAdminAlert({ alertType, message, data });
    res.json({ success: result.success, result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send admin alert" });
  }
};

// ─── USER: Resend invoice email ───────────────────────────────────────────────
exports.resendInvoice = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ success: false, message: "transactionId is required" });
    }

    const user = await User.findById(userId).select("name email transactions");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const transaction = user.transactions?.find((t) => t._id?.toString() === transactionId);
    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

    const result = await emailService.sendInvoiceResend(user, transaction);

    res.json({
      success: result.success,
      message: result.success ? `Invoice sent to ${user.email}` : "Failed to send invoice",
      error: result.success ? undefined : result.error,
    });
  } catch (err) {
    console.error("❌ resendInvoice:", err);
    res.status(500).json({ success: false, message: "Failed to resend invoice" });
  }
};

// ─── ADMIN: Test email connection ─────────────────────────────────────────────
exports.testEmailConnection = async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return res.status(400).json({ success: false, message: "ADMIN_EMAIL not set in .env" });

    const result = await emailService.sendEmail({
      to: adminEmail,
      subject: "✅ Paperxify Email Service — Connection Test",
      html: `<div style="font-family:sans-serif;background:#0a0a0a;color:#fff;padding:24px;border-radius:12px;"><h2>Connection Test Passed</h2><p>All email accounts are configured correctly. Time: ${new Date().toISOString()}</p></div>`,
      templateType: "admin_alert",
    });

    res.json({ success: result.success, provider: result.provider, messageId: result.messageId, error: result.error });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
