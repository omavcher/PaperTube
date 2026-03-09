/**
 * emailTemplates.js
 * All Paperxify HTML email templates — dark theme, matching the site aesthetic.
 * Each function returns { subject, html } ready to pass into emailService.sendEmail().
 */

// ─── Color tokens (matching site theme) ──────────────────────────────────────
const C = {
  bg: "#0a0a0a",
  card: "#141414",
  border: "#1f1f1f",
  accent: "#ffffff",
  accentMuted: "#a3a3a3",
  dim: "#525252",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#a855f7",
};

// ─── Shared layout shell ──────────────────────────────────────────────────────
const shell = (content, previewText = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Paperxify</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    /* Base Resets */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.bg}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: ${C.accentMuted}; -webkit-font-smoothing: antialiased; margin: 0; padding: 0; width: 100% !important; }
    a { color: ${C.accent}; text-decoration: none; }
    
    /* Layout */
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px 10px; }
    .card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 16px; overflow: hidden; width: 100%; }
    
    /* Header, Body, Footer */
    .header { padding: 24px 24px; border-bottom: 1px solid ${C.border}; text-align: left; }
    .logo-text { font-size: 24px; font-weight: 800; color: ${C.accent}; letter-spacing: -0.5px; }
    .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: ${C.accent}; display: inline-block; margin-left: 2px; }
    .body { padding: 28px 20px; }
    .footer { padding: 24px 20px; border-top: 1px solid ${C.border}; text-align: center; }
    .footer p { font-size: 13px; color: ${C.dim}; line-height: 1.6; margin-bottom: 8px; }
    .footer a { color: ${C.dim}; text-decoration: underline; }

    /* Typography */
    .h1 { font-size: 24px; font-weight: 800; color: ${C.accent}; line-height: 1.3; margin-bottom: 10px; letter-spacing: -0.5px; }
    .h2 { font-size: 18px; font-weight: 700; color: ${C.accent}; margin-bottom: 6px; }
    .subtitle { font-size: 15px; color: ${C.accentMuted}; line-height: 1.6; margin-bottom: 24px; }
    .p { font-size: 15px; color: ${C.accentMuted}; line-height: 1.7; margin-bottom: 16px; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: ${C.dim}; margin-bottom: 6px; display: block; }
    
    /* Buttons */
    .btn { display: inline-block; background: ${C.accent}; color: #000 !important; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 10px; letter-spacing: 0.2px; text-decoration: none; text-align: center; }
    .btn-outline { display: inline-block; border: 1px solid ${C.border}; color: ${C.accentMuted} !important; font-size: 14px; font-weight: 600; padding: 13px 26px; border-radius: 10px; text-decoration: none; text-align: center; margin-top: 8px; }
    
    /* Badges */
    .badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
    .badge-green { background: rgba(34,197,94,0.12); color: ${C.green}; border: 1px solid rgba(34,197,94,0.25); }
    .badge-amber { background: rgba(245,158,11,0.12); color: ${C.amber}; border: 1px solid rgba(245,158,11,0.25); }
    .badge-red { background: rgba(239,68,68,0.12); color: ${C.red}; border: 1px solid rgba(239,68,68,0.25); }
    .badge-blue { background: rgba(59,130,246,0.12); color: ${C.blue}; border: 1px solid rgba(59,130,246,0.25); }
    
    /* UI Elements */
    .divider { border: none; border-top: 1px solid ${C.border}; margin: 24px 0; }
    .highlight-box { background: rgba(255,255,255,0.03); border: 1px solid ${C.border}; border-radius: 12px; padding: 20px 16px; margin: 20px 0; }
    .amount-big { font-size: 32px; font-weight: 800; color: ${C.accent}; letter-spacing: -1px; }
    
    /* CSS Table rows for high compatibility */
    .info-row { display: table; width: 100%; padding: 12px 0; border-bottom: 1px solid ${C.border}; }
    .info-row:last-child { border-bottom: none; }
    .info-key { display: table-cell; font-size: 14px; color: ${C.dim}; vertical-align: middle; width: 40%; }
    .info-val { display: table-cell; font-size: 14px; font-weight: 600; color: ${C.accent}; text-align: right; vertical-align: middle; width: 60%; word-break: break-word; }
    
    /* Actual Invoice Data Tables */
    .data-table-wrapper { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 20px; }
    .table { width: 100%; min-width: 400px; border-collapse: collapse; font-size: 13px; }
    .table th { background: rgba(255,255,255,0.04); color: ${C.dim}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; font-size: 10px; padding: 12px 10px; text-align: left; border-bottom: 1px solid ${C.border}; white-space: nowrap; }
    .table td { padding: 14px 10px; border-bottom: 1px solid ${C.border}; color: ${C.accentMuted}; vertical-align: middle; }
    .table td.right { text-align: right; }
    .table th.right { text-align: right; }
    .table td.bold { font-weight: 700; color: ${C.accent}; }
    .table tr.total-row td { border-top: 2px solid ${C.border}; border-bottom: none; font-weight: 800; color: ${C.accent}; font-size: 16px; padding-top: 18px; }
    
    /* Pills/Icons */
    .token-pill { display: inline-block; background: rgba(250,204,21,0.1); color: #fbbf24; border: 1px solid rgba(250,204,21,0.25); border-radius: 8px; padding: 4px 10px; font-size: 13px; font-weight: 700; white-space: nowrap; }
    .plan-pill { display: inline-block; background: rgba(168,85,247,0.1); color: ${C.purple}; border: 1px solid rgba(168,85,247,0.25); border-radius: 8px; padding: 4px 10px; font-size: 13px; font-weight: 700; white-space: nowrap; }
    .icon-circle { width: 48px; height: 48px; border-radius: 50%; text-align: center; line-height: 48px; margin-bottom: 20px; font-size: 24px; display: inline-block; }
    .icon-circle-green { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.2); }
    .icon-circle-amber { background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.2); }
    .icon-circle-blue { background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.2); }
    .icon-circle-purple { background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.2); }
    .icon-circle-red { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.2); }

    /* Mobile overrides */
    @media screen and (max-width: 600px) {
      .wrapper { padding: 10px 5px !important; }
      .body { padding: 24px 16px !important; }
      .header { padding: 20px 16px !important; }
      .h1 { font-size: 22px !important; }
      .subtitle { font-size: 14px !important; }
      .info-key { font-size: 13px !important; }
      .info-val { font-size: 13px !important; }
      .btn { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .btn-outline { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:${C.bg};">${previewText}\u200B\u00A0\u200B\u00A0\u200B\u00A0</div>` : ""}
  <div class="wrapper">
    <div class="card">
      
      <!-- Header -->
      <div class="header">
        <span class="logo-text">Paperxify<span class="logo-dot"></span></span>
      </div>

      <!-- Body -->
      <div class="body">
        ${content}
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>© ${new Date().getFullYear()} Paperxify · Nagpur, Maharashtra, India<br/>
        <a href="https://paperxify.com">paperxify.com</a> &nbsp;·&nbsp; <a href="mailto:paperxify@gmail.com">paperxify@gmail.com</a></p>
        <p style="margin-top:10px;">You're receiving this because you have an account at Paperxify.</p>
      </div>

    </div>
  </div>
</body>
</html>
`;

// ─── Helper to format Indian currency ────────────────────────────────────────
const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// ─── Number to words (Indian) ─────────────────────────────────────────────────
const numToWords = (n) => {
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const toWord = (num) => {
    num = Math.floor(num);
    if (num === 0) return "";
    if (num < 20) return a[num] + " ";
    if (num < 100) return b[Math.floor(num / 10)] + " " + a[num % 10] + " ";
    if (num < 1000) return a[Math.floor(num / 100)] + " Hundred " + toWord(num % 100);
    if (num < 100000) return toWord(Math.floor(num / 1000)) + "Thousand " + toWord(num % 1000);
    if (num < 10000000) return toWord(Math.floor(num / 100000)) + "Lakh " + toWord(num % 100000);
    return toWord(Math.floor(num / 10000000)) + "Crore " + toWord(num % 10000000);
  };
  const parts = parseFloat(n).toFixed(2).split(".");
  let str = "Rupees " + (parseInt(parts[0]) === 0 ? "Zero " : toWord(parseInt(parts[0])));
  if (parseInt(parts[1]) > 0) str += "and " + toWord(parseInt(parts[1])) + "Paise ";
  return str.trim() + " Only";
};

// ════════════════════════════════════════════════════════════════════
// 1. WELCOME / FIRST-TIME LOGIN
// ════════════════════════════════════════════════════════════════════
exports.welcome = ({ name, email }) => ({
  subject: `Welcome to Paperxify, ${name?.split(" ")[0] || "there"}! 🎉`,
  html: shell(
    `
    <div style="text-align:center; padding-bottom: 16px;">
      <div class="icon-circle icon-circle-green">🎉</div>
    </div>
    <div class="h1">Welcome aboard, ${name?.split(" ")[0] || "Scholar"}!</div>
    <p class="subtitle">Your Paperxify account is ready. You now have access to AI-powered note generation from any YouTube video.</p>

    <div class="highlight-box">
      <div class="label">Your Account</div>
      <div style="margin-top:8px;">
        <div class="info-row"><span class="info-key">Email</span><span class="info-val">${email}</span></div>
        <div class="info-row"><span class="info-key">Free Daily Tokens</span><span class="info-val"><span class="token-pill">10 / day</span></span></div>
        <div class="info-row" style="border:none;"><span class="info-key">Status</span><span class="info-val"><span class="badge badge-green">Active</span></span></div>
      </div>
    </div>

    <p class="p">Get started by pasting any YouTube URL and letting Paperxify transform it into beautiful structured notes, instantly.</p>

    <div style="text-align:center; margin: 28px 0;">
      <a href="https://paperxify.com" class="btn">Start Generating Notes →</a>
    </div>

    <hr class="divider" />
    <p class="p" style="font-size:13px;">Need help? Just reply to this email or visit our <a href="https://paperxify.com">Help Center</a>.</p>
    `,
    `Welcome to Paperxify — let's turn videos into notes!`
  ),
});

// ════════════════════════════════════════════════════════════════════
// 2. SUBSCRIPTION PURCHASE (with full invoice)
// ════════════════════════════════════════════════════════════════════
exports.subscriptionPurchase = ({
  name,
  email,
  planName,
  billingPeriod,
  amount,
  transactionId,
  paymentId,
  expiresAt,
  timestamp,
}) => {
  const totalAmt = parseFloat(amount);
  const gstRate = 0.18;
  const baseVal = totalAmt / (1 + gstRate);
  const gstVal = totalAmt - baseVal;
  const invNo = `INV-${(transactionId || paymentId || "DRAFT").toUpperCase()}`;

  return {
    subject: `✅ Subscription Confirmed — ${planName} | ${invNo}`,
    html: shell(
      `
    <div style="text-align:center; padding-bottom: 16px;">
      <div class="icon-circle icon-circle-green">✅</div>
    </div>
    <div class="h1">Payment Confirmed!</div>
      <p class="subtitle">Your <strong style="color:#fff;">${planName}</strong> subscription is now active. Here's your tax invoice.</p>

      <!-- Invoice Meta -->
      <div class="highlight-box" style="margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
          <div>
            <div class="label">Invoice Number</div>
            <div style="font-size:15px;font-weight:700;color:#fff;font-family:monospace;">${invNo}</div>
          </div>
          <div style="text-align:right;">
            <div class="label">Date</div>
            <div style="font-size:13px;color:#a3a3a3;">${formatDate(timestamp || new Date())}</div>
          </div>
        </div>
      </div>

      <!-- Billing Details -->
      <div class="label" style="margin-bottom:12px;">Bill To</div>
      <div class="highlight-box" style="margin-bottom:24px;">
        <div class="info-row"><span class="info-key">Name</span><span class="info-val">${name}</span></div>
        <div class="info-row" style="border:none;"><span class="info-key">Email</span><span class="info-val">${email}</span></div>
      </div>

      <!-- Invoice Table -->
      <div class="data-table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>SAC Code</th>
              <th>Period</th>
              <th class="right">Taxable Value</th>
              <th class="right">IGST (18%)</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="bold">${planName}</td>
              <td>998431</td>
              <td>${billingPeriod || "Monthly"}</td>
              <td class="right">${formatINR(baseVal)}</td>
              <td class="right">${formatINR(gstVal)}</td>
              <td class="right bold">${formatINR(totalAmt)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="4"></td>
              <td class="right" style="font-size:13px;color:#a3a3a3;">Grand Total</td>
              <td class="right">${formatINR(totalAmt)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin:16px 0 24px; font-size:12px; color:${C.dim}; font-style:italic;">
        ${numToWords(totalAmt)}
      </div>

      <!-- Plan Details -->
      <div class="highlight-box">
        <div class="info-row"><span class="info-key">Plan</span><span class="info-val"><span class="plan-pill">${planName}</span></span></div>
        <div class="info-row"><span class="info-key">Billing Period</span><span class="info-val">${billingPeriod || "Monthly"}</span></div>
        <div class="info-row"><span class="info-key">Active Until</span><span class="info-val">${formatDate(expiresAt)}</span></div>
        <div class="info-row" style="border:none;"><span class="info-key">Payment ID</span><span class="info-val" style="font-family:monospace;font-size:11px;">${paymentId || "—"}</span></div>
      </div>

      <div style="text-align:center; margin: 28px 0;">
        <a href="https://paperxify.com/profile" class="btn">View Your Plan →</a>
      </div>

      <p class="p" style="font-size:12px;color:${C.dim};">This is a computer-generated invoice and does not require a physical signature. Registered under GST (IGST @18%). For any queries, email us at paperxify@gmail.com.</p>
      `,
      `Your ${planName} subscription is now active!`
    ),
  };
};

// ════════════════════════════════════════════════════════════════════
// 3. TOKEN PURCHASE (with invoice)
// ════════════════════════════════════════════════════════════════════
exports.tokenPurchase = ({
  name,
  email,
  packageName,
  tokensAwarded,
  amount,
  transactionId,
  paymentId,
  timestamp,
}) => {
  const totalAmt = parseFloat(amount);
  const gstRate = 0.18;
  const baseVal = totalAmt / (1 + gstRate);
  const gstVal = totalAmt - baseVal;
  const invNo = `INV-${(transactionId || paymentId || "DRAFT").toUpperCase()}`;

  return {
    subject: `🪙 ${tokensAwarded} Tokens Added — ${invNo}`,
    html: shell(
      `
      <div style="text-align:center; padding-bottom: 16px;">
        <div class="icon-circle icon-circle-amber">🪙</div>
      </div>
      <div class="h1">${tokensAwarded?.toLocaleString("en-IN")} Tokens Added!</div>
      <p class="subtitle">Your <strong style="color:#fff;">${packageName}</strong> token pack has been added to your account successfully.</p>

      <!-- Invoice Meta -->
      <div class="highlight-box" style="margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
          <div>
            <div class="label">Invoice Number</div>
            <div style="font-size:15px;font-weight:700;color:#fff;font-family:monospace;">${invNo}</div>
          </div>
          <div style="text-align:right;">
            <div class="label">Date</div>
            <div style="font-size:13px;color:#a3a3a3;">${formatDate(timestamp || new Date())}</div>
          </div>
        </div>
      </div>

      <!-- Bill To -->
      <div class="label" style="margin-bottom:12px;">Bill To</div>
      <div class="highlight-box" style="margin-bottom:24px;">
        <div class="info-row"><span class="info-key">Name</span><span class="info-val">${name}</span></div>
        <div class="info-row" style="border:none;"><span class="info-key">Email</span><span class="info-val">${email}</span></div>
      </div>

      <!-- Invoice Table -->
      <div class="data-table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>SAC Code</th>
              <th>Tokens</th>
              <th class="right">Taxable Value</th>
              <th class="right">IGST (18%)</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="bold">${packageName}</td>
              <td>998431</td>
              <td><span class="token-pill">${tokensAwarded?.toLocaleString("en-IN")}</span></td>
              <td class="right">${formatINR(baseVal)}</td>
              <td class="right">${formatINR(gstVal)}</td>
              <td class="right bold">${formatINR(totalAmt)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="4"></td>
              <td class="right" style="font-size:13px;color:#a3a3a3;">Grand Total</td>
              <td class="right">${formatINR(totalAmt)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin:16px 0 24px; font-size:12px; color:${C.dim}; font-style:italic;">
        ${numToWords(totalAmt)}
      </div>

      <div style="text-align:center; margin: 28px 0;">
        <a href="https://paperxify.com" class="btn">Start Using Tokens →</a>
      </div>

      <p class="p" style="font-size:12px;color:${C.dim};">Computer-generated invoice · IGST @18% · paperxify@gmail.com</p>
      `,
      `${tokensAwarded?.toLocaleString("en-IN")} tokens have been added to your Paperxify account!`
    ),
  };
};

// ════════════════════════════════════════════════════════════════════
// 4. SUBSCRIPTION EXPIRING SOON (warning)
// ════════════════════════════════════════════════════════════════════
exports.subscriptionExpiring = ({ name, planName, expiresAt, daysLeft }) => ({
  subject: `⚠️ Your ${planName} subscription expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
  html: shell(
    `
      <div style="text-align:center; padding-bottom: 16px;">
        <div class="icon-circle icon-circle-amber">⏳</div>
      </div>
      <div class="h1">Don't lose your premium access!</div>
    <p class="subtitle">Hi <strong style="color:#fff;">${name?.split(" ")[0]}</strong>, your <strong style="color:#fff;">${planName}</strong> subscription is expiring soon.</p>

    <div class="highlight-box" style="text-align:center;">
      <div class="label" style="margin-bottom:8px;">Expiring On</div>
      <div style="font-size:28px;font-weight:800;color:#f59e0b;">${formatDate(expiresAt)}</div>
      <div style="font-size:14px;color:#a3a3a3;margin-top:6px;"><span class="badge badge-amber">${daysLeft} Day${daysLeft !== 1?"s":""} Left</span></div>
    </div>

    <p class="p">Once your subscription expires, you'll be moved to the free plan (10 daily tokens). Don't let your workflow be interrupted — renew now and keep your unlimited access.</p>

    <div style="text-align:center; margin: 28px 0;">
      <a href="https://paperxify.com/pricing" class="btn">Renew Now →</a>
    </div>

    <hr class="divider" />
    <p class="p" style="font-size:13px;">Questions about your plan? Reply to this email and we'll help you out.</p>
    `,
    `Your ${planName} subscription expires in ${daysLeft} days — renew now to keep premium access.`
  ),
});

// ════════════════════════════════════════════════════════════════════
// 5. SUBSCRIPTION EXPIRED
// ════════════════════════════════════════════════════════════════════
exports.subscriptionExpired = ({ name, planName, expiredAt }) => ({
  subject: `😔 Your ${planName} subscription has expired`,
  html: shell(
    `
    <div style="text-align:center; padding-bottom: 16px;">
      <div class="icon-circle icon-circle-red">❌</div>
    </div>
    <div class="h1">Your subscription has ended</div>
    <p class="subtitle">Hi <strong style="color:#fff;">${name?.split(" ")[0]}</strong>, your <strong style="color:#fff;">${planName}</strong> subscription expired on ${formatDate(expiredAt)}.</p>

    <div class="highlight-box">
      <div class="info-row"><span class="info-key">Previous Plan</span><span class="info-val"><span class="plan-pill">${planName}</span></span></div>
      <div class="info-row" style="border:none;"><span class="info-key">Current Status</span><span class="info-val"><span class="badge badge-red">Expired</span></span></div>
    </div>

    <p class="p">You've been moved to our free plan (10 daily tokens). Resubscribe anytime to restore your unlimited access, priority features, and advanced AI models.</p>

    <div style="text-align:center; margin: 28px 0;">
      <a href="https://paperxify.com/pricing" class="btn">Resubscribe Now →</a>
    </div>
    `,
    `Your Paperxify subscription has expired — renew to restore premium access.`
  ),
});

// ════════════════════════════════════════════════════════════════════
// 6. SUBSCRIPTION RENEWED
// ════════════════════════════════════════════════════════════════════
exports.subscriptionRenewed = ({
  name,
  planName,
  billingPeriod,
  amount,
  newExpiresAt,
  paymentId,
}) => ({
  subject: `🔄 Subscription Renewed — ${planName}`,
  html: shell(
    `
    <div style="text-align:center; padding-bottom: 16px;">
      <div class="icon-circle icon-circle-green">🔄</div>
    </div>
    <div class="h1">Successfully Renewed!</div>
    <p class="subtitle">Hi <strong style="color:#fff;">${name?.split(" ")[0]}</strong>, your <strong style="color:#fff;">${planName}</strong> subscription has been renewed.</p>

    <div class="highlight-box">
      <div class="info-row"><span class="info-key">Plan</span><span class="info-val"><span class="plan-pill">${planName}</span></span></div>
      <div class="info-row"><span class="info-key">Billing Period</span><span class="info-val">${billingPeriod || "Monthly"}</span></div>
      <div class="info-row"><span class="info-key">Amount Charged</span><span class="info-val">${formatINR(amount)}</span></div>
      <div class="info-row"><span class="info-key">New Expiry</span><span class="info-val">${formatDate(newExpiresAt)}</span></div>
      <div class="info-row" style="border:none;"><span class="info-key">Payment ID</span><span class="info-val" style="font-family:monospace;font-size:11px;">${paymentId || "—"}</span></div>
    </div>

    <div style="text-align:center; margin: 28px 0;">
      <a href="https://paperxify.com/profile" class="btn">View Plan Details →</a>
    </div>
    `,
    `Your ${planName} has been renewed until ${formatDate(newExpiresAt)}.`
  ),
});

// ════════════════════════════════════════════════════════════════════
// 7. LOW TOKEN ALERT
// ════════════════════════════════════════════════════════════════════
exports.lowTokens = ({ name, tokensLeft }) => ({
  subject: `🔋 Low tokens — you have ${tokensLeft} left`,
  html: shell(
    `
    <div style="text-align:center; padding-bottom: 16px;">
      <div class="icon-circle icon-circle-amber">🔋</div>
    </div>
    <div class="h1">Running low on tokens</div>
    <p class="subtitle">Hi <strong style="color:#fff;">${name?.split(" ")[0]}</strong>, you only have <strong style="color:#fbbf24;">${tokensLeft} tokens</strong> remaining. Top up before you run out!</p>

    <div class="highlight-box" style="text-align:center;">
      <div class="label" style="margin-bottom:12px;">Current Balance</div>
      <div class="amount-big" style="color:#fbbf24;">${tokensLeft}</div>
      <div style="font-size:13px;color:#a3a3a3;margin-top:6px;">tokens remaining</div>
    </div>

    <p class="p">Don't let an empty token balance slow you down. Top up now or upgrade to a premium subscription for unlimited daily access.</p>

    <div style="text-align:center; margin: 28px 0; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
      <a href="https://paperxify.com/pricing" class="btn">Buy Tokens →</a>
      <a href="https://paperxify.com/pricing" class="btn-outline">View Plans</a>
    </div>
    `,
    `You only have ${tokensLeft} tokens left — top up now!`
  ),
});

// ════════════════════════════════════════════════════════════════════
// 8. STANDALONE INVOICE (resend from profile page)
// ════════════════════════════════════════════════════════════════════
exports.invoiceResend = ({
  name,
  email,
  packageName,
  packageType,
  billingPeriod,
  amount,
  transactionId,
  paymentId,
  timestamp,
}) => {
  const totalAmt = parseFloat(amount);
  const gstRate = 0.18;
  const baseVal = totalAmt / (1 + gstRate);
  const gstVal = totalAmt - baseVal;
  const invNo = `INV-${(transactionId || paymentId || "DRAFT").toUpperCase()}`;

  return {
    subject: `📄 Your Paperxify Invoice — ${invNo}`,
    html: shell(
      `
      <div style="text-align:center; padding-bottom: 16px;">
        <div class="icon-circle icon-circle-blue">📄</div>
      </div>
      <div class="h1">Tax Invoice</div>
      <p class="subtitle">Here is your requested invoice for the purchase made on ${formatDate(timestamp || new Date())}.</p>

      <div class="highlight-box" style="margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <div>
            <div class="label">Invoice Number</div>
            <div style="font-size:15px;font-weight:700;color:#fff;font-family:monospace;">${invNo}</div>
          </div>
          <div style="text-align:right;">
            <div class="label">Date</div>
            <div style="font-size:13px;color:#a3a3a3;">${formatDate(timestamp || new Date())}</div>
          </div>
        </div>
      </div>

      <div class="label" style="margin-bottom:12px;">Bill To</div>
      <div class="highlight-box" style="margin-bottom:24px;">
        <div class="info-row"><span class="info-key">Name</span><span class="info-val">${name}</span></div>
        <div class="info-row" style="border:none;"><span class="info-key">Email</span><span class="info-val">${email}</span></div>
      </div>

      <div class="data-table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>SAC Code</th>
              <th>${packageType === "subscription" ? "Period" : "Tokens"}</th>
              <th class="right">Taxable Value</th>
              <th class="right">IGST (18%)</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="bold">${packageName}</td>
              <td>998431</td>
              <td>${billingPeriod || "One-time"}</td>
              <td class="right">${formatINR(baseVal)}</td>
              <td class="right">${formatINR(gstVal)}</td>
              <td class="right bold">${formatINR(totalAmt)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="4"></td>
              <td class="right" style="font-size:13px;color:#a3a3a3;">Grand Total</td>
              <td class="right">${formatINR(totalAmt)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin:16px 0 24px; font-size:12px; color:${C.dim}; font-style:italic;">
        ${numToWords(totalAmt)}
      </div>

      <p class="p" style="font-size:12px;color:${C.dim};">Computer-generated invoice · IGST @18% · Not a physical document · paperxify@gmail.com</p>
      `,
      `Your Paperxify tax invoice ${invNo}`
    ),
  };
};

// ════════════════════════════════════════════════════════════════════
// 9. MARKETING — Custom campaign (admin sends)
// ════════════════════════════════════════════════════════════════════
exports.marketing = ({
  subject,
  headline,
  subheadline,
  body,
  ctaText,
  ctaUrl,
  footerNote,
  badgeText,
  badgeType = "blue", // blue | green | amber | red | purple
}) => ({
  subject,
  html: shell(
    `
    ${badgeText ? `<div style="margin-bottom:16px;"><span class="badge badge-${badgeType}">${badgeText}</span></div>` : ""}
    <div class="h1">${headline}</div>
    ${subheadline ? `<p class="subtitle">${subheadline}</p>` : ""}

    <hr class="divider" />

    <div style="font-size:15px;color:#a3a3a3;line-height:1.8;">${body}</div>

    ${
      ctaText && ctaUrl
        ? `<div style="text-align:center; margin: 32px 0;">
        <a href="${ctaUrl}" class="btn">${ctaText}</a>
      </div>`
        : ""
    }

    ${footerNote ? `<p class="p" style="font-size:12px;color:${C.dim};">${footerNote}</p>` : ""}
    `,
    subheadline || headline
  ),
});

// ════════════════════════════════════════════════════════════════════
// 10. ADMIN ALERT (system/admin internal)
// ════════════════════════════════════════════════════════════════════
exports.adminAlert = ({ alertType, message, data }) => ({
  subject: `🔔 Admin Alert: ${alertType}`,
  html: shell(
    `
    <div style="text-align:center; padding-bottom: 16px;">
      <div class="icon-circle icon-circle-red">🔔</div>
    </div>
    <div class="h1">Admin Notification</div>
    <div class="badge badge-red" style="margin-bottom:20px;">${alertType}</div>

    <div class="highlight-box">
      <p class="p" style="margin:0;">${message}</p>
    </div>

    ${
      data
        ? `<div class="highlight-box" style="margin-top:16px;">
        <div class="label" style="margin-bottom:8px;">Additional Data</div>
        <pre style="font-size:12px;color:#a3a3a3;white-space:pre-wrap;font-family:monospace;">${
          typeof data === "object" ? JSON.stringify(data, null, 2) : data
        }</pre>
      </div>`
        : ""
    }

    <p class="p" style="font-size:12px;color:${C.dim};margin-top:20px;">This is an automated system notification sent to admins only.</p>
    `,
    `Admin Alert: ${alertType}`
  ),
});
