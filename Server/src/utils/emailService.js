/**
 * emailService.js
 *
 * Multi-account Nodemailer service with automatic failover.
 * - Tries EMAIL_ACCOUNTS in order; if one fails, transparently moves to the next.
 * - Logs every send attempt to the EmailLog collection.
 * - NEVER throws to callers — returns { success, messageId?, error? }.
 *
 * ENV variables to set (in .env):
 *  EMAIL_ACCOUNT_1_USER=paperxify@gmail.com
 *  EMAIL_ACCOUNT_1_PASS=app_password_here
 *  EMAIL_ACCOUNT_2_USER=backup@gmail.com
 *  EMAIL_ACCOUNT_2_PASS=app_password_here
 *  EMAIL_ACCOUNT_3_USER=third@gmail.com
 *  EMAIL_ACCOUNT_3_PASS=app_password_here
 *  EMAIL_FROM_NAME=Paperxify
 */

const nodemailer = require("nodemailer");
const EmailLog = require("../models/EmailLog");

// ─── Build SMTP account pool from ENV ────────────────────────────────────────
const buildAccountPool = () => {
  const accounts = [];
  let i = 1;
  while (true) {
    const user = process.env[`EMAIL_ACCOUNT_${i}_USER`];
    const pass = process.env[`EMAIL_ACCOUNT_${i}_PASS`];
    if (!user || !pass) break;
    accounts.push({ user, pass, label: `Account-${i}` });
    i++;
  }

  // Fallback: if no numbered accounts, try legacy single-account ENV
  if (accounts.length === 0 && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    accounts.push({
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      label: "Account-legacy",
    });
  }

  return accounts;
};

// ─── Create a transporter for a given account ─────────────────────────────────
const createTransporter = ({ user, pass }) =>
  nodemailer.createTransport({
    service: "gmail",
    auth: { type: "LOGIN", user, pass },
    tls: { rejectUnauthorized: false },
  });

// ─── Core send function (with failover) ───────────────────────────────────────
/**
 * sendEmail({ to, toName, subject, html, templateType, templateData, userId })
 * Returns: { success: bool, messageId?: string, provider?: string, error?: string }
 */
const sendEmail = async ({
  to,
  toName = "",
  subject,
  html,
  templateType = "custom",
  templateData = {},
  userId = null,
}) => {
  const accounts = buildAccountPool();
  const fromName = process.env.EMAIL_FROM_NAME || "Paperxify";

  // We'll create a log entry and update it after send
  let logEntry = null;
  try {
    logEntry = await EmailLog.create({
      to,
      toName,
      userId,
      subject,
      templateType,
      templateData,
      status: "pending",
      provider: "",
      attemptCount: 0,
    });
  } catch (logErr) {
    // Log creation failure should never block email sending
    console.error("⚠️ [EmailService] Could not create log entry:", logErr.message);
  }

  if (accounts.length === 0) {
    const errMsg = "No email accounts configured. Set EMAIL_ACCOUNT_1_USER and EMAIL_ACCOUNT_1_PASS in .env";
    console.error("❌ [EmailService]", errMsg);
    if (logEntry) {
      await EmailLog.findByIdAndUpdate(logEntry._id, { status: "failed", error: errMsg }).catch(() => {});
    }
    return { success: false, error: errMsg };
  }

  let lastError = null;

  for (let idx = 0; idx < accounts.length; idx++) {
    const account = accounts[idx];
    try {
      console.log(`📧 [EmailService] Attempting via ${account.label} (${account.user}) → ${to}`);

      const transporter = createTransporter(account);
      const mailOptions = {
        from: `"${fromName}" <${account.user}>`,
        to: toName ? `"${toName}" <${to}>` : to,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);

      console.log(`✅ [EmailService] Sent via ${account.label} — messageId: ${info.messageId}`);

      // Update log entry → success
      if (logEntry) {
        await EmailLog.findByIdAndUpdate(logEntry._id, {
          status: "sent",
          provider: account.label,
          messageId: info.messageId,
          error: null,
          attemptCount: idx + 1,
        }).catch(() => {});
      }

      return { success: true, messageId: info.messageId, provider: account.label };
    } catch (err) {
      lastError = err.message;
      console.warn(
        `⚠️ [EmailService] ${account.label} failed (attempt ${idx + 1}/${accounts.length}): ${err.message}`
      );
    }
  }

  // All accounts exhausted
  console.error(`❌ [EmailService] All ${accounts.length} account(s) failed. Last error: ${lastError}`);

  if (logEntry) {
    await EmailLog.findByIdAndUpdate(logEntry._id, {
      status: "failed",
      error: lastError,
      attemptCount: accounts.length,
    }).catch(() => {});
  }

  return { success: false, error: lastError };
};

// ─── Convenience wrappers ─────────────────────────────────────────────────────
const templates = require("./emailTemplates");

/**
 * sendWelcome(user)
 * user: { name, email, _id? }
 */
const sendWelcome = async (user) => {
  try {
    const { subject, html } = templates.welcome({ name: user.name, email: user.email });
    return await sendEmail({
      to: user.email,
      toName: user.name,
      subject,
      html,
      templateType: "welcome",
      userId: user._id || null,
    });
  } catch (e) {
    console.error("❌ [EmailService] sendWelcome error:", e.message);
    return { success: false, error: e.message };
  }
};

/**
 * sendSubscriptionPurchase(user, transaction)
 * Sends invoice + confirmation email after subscription buy.
 */
const sendSubscriptionPurchase = async (user, transaction) => {
  try {
    const { subject, html } = templates.subscriptionPurchase({
      name: user.name,
      email: user.email,
      planName: transaction.packageName,
      billingPeriod: transaction.billingPeriod,
      amount: transaction.amount,
      transactionId: transaction._id?.toString() || transaction.paymentId,
      paymentId: transaction.paymentId,
      expiresAt: user.membership?.expiresAt,
      timestamp: transaction.timestamp,
    });
    return await sendEmail({
      to: user.email,
      toName: user.name,
      subject,
      html,
      templateType: "subscription_purchase",
      userId: user._id || null,
      templateData: { packageName: transaction.packageName, amount: transaction.amount },
    });
  } catch (e) {
    console.error("❌ [EmailService] sendSubscriptionPurchase error:", e.message);
    return { success: false, error: e.message };
  }
};

/**
 * sendTokenPurchase(user, transaction)
 * Sends invoice + confirmation after token pack buy.
 */
const sendTokenPurchase = async (user, transaction) => {
  try {
    const { subject, html } = templates.tokenPurchase({
      name: user.name,
      email: user.email,
      packageName: transaction.packageName,
      tokensAwarded: transaction.tokens,
      amount: transaction.amount,
      transactionId: transaction._id?.toString() || transaction.paymentId,
      paymentId: transaction.paymentId,
      timestamp: transaction.timestamp,
    });
    return await sendEmail({
      to: user.email,
      toName: user.name,
      subject,
      html,
      templateType: "token_purchase",
      userId: user._id || null,
      templateData: { packageName: transaction.packageName, tokens: transaction.tokens },
    });
  } catch (e) {
    console.error("❌ [EmailService] sendTokenPurchase error:", e.message);
    return { success: false, error: e.message };
  }
};

/**
 * sendSubscriptionExpiring(user, daysLeft)
 */
const sendSubscriptionExpiring = async (user, daysLeft) => {
  try {
    const { subject, html } = templates.subscriptionExpiring({
      name: user.name,
      planName: user.membership?.planName || "Your Plan",
      expiresAt: user.membership?.expiresAt,
      daysLeft,
    });
    return await sendEmail({
      to: user.email,
      toName: user.name,
      subject,
      html,
      templateType: "subscription_expiring",
      userId: user._id || null,
    });
  } catch (e) {
    console.error("❌ [EmailService] sendSubscriptionExpiring error:", e.message);
    return { success: false, error: e.message };
  }
};

/**
 * sendSubscriptionExpired(user)
 */
const sendSubscriptionExpired = async (user) => {
  try {
    const { subject, html } = templates.subscriptionExpired({
      name: user.name,
      planName: user.membership?.planName || "Premium Plan",
      expiredAt: user.membership?.expiresAt || new Date(),
    });
    return await sendEmail({
      to: user.email,
      toName: user.name,
      subject,
      html,
      templateType: "subscription_expired",
      userId: user._id || null,
    });
  } catch (e) {
    console.error("❌ [EmailService] sendSubscriptionExpired error:", e.message);
    return { success: false, error: e.message };
  }
};

/**
 * sendSubscriptionRenewed(user, transaction)
 */
const sendSubscriptionRenewed = async (user, transaction) => {
  try {
    const { subject, html } = templates.subscriptionRenewed({
      name: user.name,
      planName: transaction.packageName || user.membership?.planName,
      billingPeriod: transaction.billingPeriod,
      amount: transaction.amount,
      newExpiresAt: user.membership?.expiresAt,
      paymentId: transaction.paymentId,
    });
    return await sendEmail({
      to: user.email,
      toName: user.name,
      subject,
      html,
      templateType: "subscription_renewed",
      userId: user._id || null,
    });
  } catch (e) {
    console.error("❌ [EmailService] sendSubscriptionRenewed error:", e.message);
    return { success: false, error: e.message };
  }
};

/**
 * sendLowTokenAlert(user)
 */
const sendLowTokenAlert = async (user) => {
  try {
    const { subject, html } = templates.lowTokens({
      name: user.name,
      tokensLeft: user.token ?? user.tokens ?? 0,
    });
    return await sendEmail({
      to: user.email,
      toName: user.name,
      subject,
      html,
      templateType: "low_tokens",
      userId: user._id || null,
    });
  } catch (e) {
    console.error("❌ [EmailService] sendLowTokenAlert error:", e.message);
    return { success: false, error: e.message };
  }
};

/**
 * sendInvoiceResend(user, transaction)
 * Called when user clicks "Email Invoice" from Profile page.
 */
const sendInvoiceResend = async (user, transaction) => {
  try {
    const { subject, html } = templates.invoiceResend({
      name: user.name,
      email: user.email,
      packageName: transaction.packageName,
      packageType: transaction.packageType,
      billingPeriod: transaction.billingPeriod,
      amount: transaction.amount,
      transactionId: transaction._id?.toString() || transaction.paymentId,
      paymentId: transaction.paymentId,
      timestamp: transaction.timestamp,
    });
    return await sendEmail({
      to: user.email,
      toName: user.name,
      subject,
      html,
      templateType: "invoice",
      userId: user._id || null,
      templateData: { transactionId: transaction._id?.toString() },
    });
  } catch (e) {
    console.error("❌ [EmailService] sendInvoiceResend error:", e.message);
    return { success: false, error: e.message };
  }
};

/**
 * sendMarketing(opts)
 * opts: { to, toName?, subject, headline, subheadline?, body, ctaText?, ctaUrl?, footerNote?, badgeText?, badgeType? }
 */
const sendMarketing = async (opts) => {
  try {
    const { subject, html } = templates.marketing(opts);
    return await sendEmail({
      to: opts.to,
      toName: opts.toName || "",
      subject,
      html,
      templateType: "marketing",
      templateData: { campaign: opts.subject },
    });
  } catch (e) {
    console.error("❌ [EmailService] sendMarketing error:", e.message);
    return { success: false, error: e.message };
  }
};

/**
 * sendAdminAlert(opts)
 * opts: { alertType, message, data? }
 */
const sendAdminAlert = async (opts) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return { success: false, error: "ADMIN_EMAIL not set" };

    const { subject, html } = templates.adminAlert(opts);
    return await sendEmail({
      to: adminEmail,
      subject,
      html,
      templateType: "admin_alert",
    });
  } catch (e) {
    console.error("❌ [EmailService] sendAdminAlert error:", e.message);
    return { success: false, error: e.message };
  }
};

/**
 * sendBulkMarketing({ recipients: [{email, name}], ...templateOpts })
 * Fires one email per recipient with rate limiting (~200ms gap).
 * Returns array of results.
 */
const sendBulkMarketing = async ({ recipients, ...templateOpts }) => {
  const results = [];
  for (const recipient of recipients) {
    const result = await sendMarketing({ ...templateOpts, to: recipient.email, toName: recipient.name });
    results.push({ email: recipient.email, ...result });
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }
  return results;
};

module.exports = {
  sendEmail,
  sendWelcome,
  sendSubscriptionPurchase,
  sendTokenPurchase,
  sendSubscriptionExpiring,
  sendSubscriptionExpired,
  sendSubscriptionRenewed,
  sendLowTokenAlert,
  sendInvoiceResend,
  sendMarketing,
  sendBulkMarketing,
  sendAdminAlert,
};
