/**
 * emailService.js
 *
 * Integrated Resend email service.
 * - Logs every send attempt to the EmailLog collection.
 * - NEVER throws to callers — returns { success, messageId?, error? }.
 */

const { Resend } = require("resend");
const EmailLog = require("../models/EmailLog");

// Initialize Resend lazily to prevent server crashes if env key is not loaded yet
let resend = null;
const getResendInstance = () => {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");
  }
  return resend;
};

// ─── Core send function using Resend ──────────────────────────────────────────
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
  const fromName = process.env.EMAIL_FROM_NAME || "Paperxify";
  const apiKey = process.env.RESEND_API_KEY;

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
      provider: "Resend",
      attemptCount: 1,
    });
  } catch (logErr) {
    // Log creation failure should never block email sending
    console.error("⚠️ [EmailService] Could not create log entry:", logErr.message);
  }

  if (!apiKey) {
    const errMsg = "Resend API key is not configured. Set RESEND_API_KEY in .env";
    console.error("❌ [EmailService]", errMsg);
    if (logEntry) {
      await EmailLog.findByIdAndUpdate(logEntry._id, { status: "failed", error: errMsg }).catch(() => {});
    }
    return { success: false, error: errMsg };
  }

  try {
    console.log(`📧 [EmailService] Attempting send via Resend → ${to}`);

    // Standard Resend sandbox from address or custom domain from address
    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
    const fromHeader = `"${fromName}" <${fromEmail}>`;

    const response = await getResendInstance().emails.send({
      from: fromHeader,
      to: [to],
      subject,
      html,
    });

    if (response.error) {
      console.error("❌ [EmailService] Resend returned error:", response.error);
      if (logEntry) {
        await EmailLog.findByIdAndUpdate(logEntry._id, {
          status: "failed",
          error: response.error.message || JSON.stringify(response.error),
        }).catch(() => {});
      }
      return { success: false, error: response.error.message || "Resend failed to send email" };
    }

    const messageId = response.data?.id || "resend-msg-id";
    console.log(`✅ [EmailService] Sent via Resend — messageId: ${messageId}`);

    // Update log entry → success
    if (logEntry) {
      await EmailLog.findByIdAndUpdate(logEntry._id, {
        status: "sent",
        messageId: messageId,
        error: null,
      }).catch(() => {});
    }

    return { success: true, messageId: messageId, provider: "Resend" };
  } catch (err) {
    console.error("❌ [EmailService] Resend threw exception:", err.message);
    if (logEntry) {
      await EmailLog.findByIdAndUpdate(logEntry._id, {
        status: "failed",
        error: err.message,
      }).catch(() => {});
    }
    return { success: false, error: err.message };
  }
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

/**
 * sendVerificationOtp(email, otpCode, purpose)
 */
const sendVerificationOtp = async (email, otpCode, purpose = "signup") => {
  try {
    const { subject, html } = templates.verificationOtp({ otpCode, purpose });
    return await sendEmail({
      to: email,
      subject,
      html,
      templateType: "otp",
    });
  } catch (e) {
    console.error("❌ [EmailService] sendVerificationOtp error:", e.message);
    return { success: false, error: e.message };
  }
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
  sendVerificationOtp,
};
