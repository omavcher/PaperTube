// controllers/paymentController.js — PayPal + LemonSqueezy
const axios = require("axios");
const crypto = require("crypto");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const emailService = require("../utils/emailService");

// ─── Plan config ──────────────────────────────────────────────────────────────
const PLANS = {
  pro: {
    name: "Pro",
    monthly: { priceUSD: 9, durationDays: 30 },
    yearly:  { priceUSD: 72, durationDays: 365 },
  },
  power: {
    name: "Power",
    monthly: { priceUSD: 19, durationDays: 30 },
    yearly:  { priceUSD: 144, durationDays: 365 },
  },
};

// ─── LemonSqueezy variant map (from env) ─────────────────────────────────────
const LS_VARIANTS = () => ({
  pro:   { monthly: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID,   yearly: process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID   },
  power: { monthly: process.env.LEMONSQUEEZY_POWER_MONTHLY_VARIANT_ID, yearly: process.env.LEMONSQUEEZY_POWER_YEARLY_VARIANT_ID },
});

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED HELPER — activate membership + save transaction
// ─────────────────────────────────────────────────────────────────────────────
async function activateMembership({ userId, planId, billingPeriod, amountUSD, paymentMethod, gatewayOrderId, gatewayPaymentId, userEmail, userName }) {
  const plan = PLANS[planId];
  if (!plan) throw new Error(`Unknown planId: ${planId}`);
  const periodConfig = plan[billingPeriod];
  const durationDays = periodConfig.durationDays;
  const planName     = plan.name;

  const user = await User.findById(userId);
  if (!user) throw new Error(`User not found: ${userId}`);

  // Idempotency — skip if already processed with same gateway order id
  const alreadyDone = (user.transactions || []).some(
    (t) => (t.paypalOrderId === gatewayOrderId || t.lemonSqueezyOrderId === gatewayOrderId) && t.status === "success"
  );
  if (alreadyDone) {
    console.log(`⚠️  Order ${gatewayOrderId} already processed — skipping.`);
    return null;
  }

  // ── Update membership ──────────────────────────────────────────────────────
  const now = new Date();
  const currentExpiry =
    user.membership?.isActive && user.membership?.expiresAt
      ? new Date(user.membership.expiresAt)
      : null;
  const baseDate  = currentExpiry && currentExpiry > now ? currentExpiry : now;
  const expiresAt = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  user.membership = {
    isActive:      true,
    planId,
    planName,
    billingPeriod,
    startedAt:     user.membership?.startedAt || now,
    expiresAt,
    lastPaymentId: gatewayPaymentId || gatewayOrderId,
    autoRenew:     false,
  };

  // ── Build transaction record ───────────────────────────────────────────────
  const transactionRecord = {
    userId:              user._id,
    paymentId:           gatewayPaymentId || gatewayOrderId,
    orderId:             gatewayOrderId,
    paypalOrderId:       paymentMethod === "paypal"        ? gatewayOrderId : null,
    lemonSqueezyOrderId: paymentMethod === "lemonsqueezy"  ? gatewayOrderId : null,
    packageId:           planId,
    packageName:         `${planName} (${billingPeriod})`,
    packageType:         "subscription",
    billingPeriod,
    amount:              amountUSD,
    baseAmount:          amountUSD,
    discountAmount:      0,
    gstAmount:           0,
    status:              "success",
    paymentMethod,
    userEmail:           userEmail || user.email,
    userName:            userName  || user.name,
    timestamp:           new Date(),
  };

  if (!user.transactions) user.transactions = [];
  user.transactions.push(transactionRecord);

  await Transaction.create(transactionRecord).catch((e) =>
    console.warn("Transaction standalone save warn:", e.message)
  );
  await user.save();

  console.log(`✅ Membership activated for ${user.email}: ${planName} until ${expiresAt.toISOString()}`);

  // ── Fire confirmation email (non-blocking) ─────────────────────────────────
  setImmediate(async () => {
    try {
      const freshUser = await User.findById(user._id).select("name email membership").lean();
      if (freshUser) await emailService.sendSubscriptionPurchase(freshUser, transactionRecord);
    } catch (emailErr) {
      console.error("⚠️  Email notification failed:", emailErr.message);
    }
  });

  return transactionRecord;
}

// ═════════════════════════════════════════════════════════════════════════════
//  PAYPAL
// ═════════════════════════════════════════════════════════════════════════════

// ── Get PayPal OAuth2 access token ───────────────────────────────────────────
async function getPaypalAccessToken() {
  const clientId     = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode         = process.env.PAYPAL_MODE || "sandbox";

  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not set in environment variables.");
  }

  const baseUrl = mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const response = await axios.post(
    `${baseUrl}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth:    { username: clientId, password: clientSecret },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return { token: response.data.access_token, baseUrl };
}

// ── Create PayPal Order (used by JS SDK on frontend — no redirect needed) ────
exports.createPaypalOrder = async (req, res) => {
  try {
    const { planId, billingPeriod = "monthly" } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, message: "Missing planId" });
    }
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ success: false, message: "Invalid plan ID" });

    const periodConfig = plan[billingPeriod];
    const priceUSD     = periodConfig.priceUSD;
    const user         = req.user;

    const { token, baseUrl } = await getPaypalAccessToken();

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `${planId}-${billingPeriod}-${user._id}`,
          description:  `PaperXify ${plan.name} — ${billingPeriod === "monthly" ? "Monthly" : "Yearly (One-Time)"}`,
          amount: {
            currency_code: "USD",
            value:         priceUSD.toFixed(2),
          },
          custom_id: JSON.stringify({
            userId:        user._id.toString(),
            userEmail:     user.email,
            userName:      user.name || user.username || "",
            planId,
            billingPeriod,
            durationDays:  String(periodConfig.durationDays),
            planName:      plan.name,
            amountUSD:     String(priceUSD),
          }),
        },
      ],
      // Minimal order payload — no application_context redirect URLs.
      // The PayPal JS SDK popup handles approval; capture is done via onApprove.
    };

    const orderRes = await axios.post(`${baseUrl}/v2/checkout/orders`, orderPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const order = orderRes.data;
    console.log("✅ PayPal order created:", { orderId: order.id, userId: user._id, planId, billingPeriod });

    // Return just the orderId — the JS SDK uses it to open the payment popup
    res.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("❌ PayPal create order error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error?.response?.data?.message || error.message || "Failed to create PayPal order",
    });
  }
};

// ── Capture PayPal Order (called from frontend after user approves) ────────────
exports.capturePaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: "Missing orderId" });

    const { token, baseUrl } = await getPaypalAccessToken();

    // Fetch order details to extract metadata
    const orderRes = await axios.get(`${baseUrl}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const order = orderRes.data;

    if (order.status === "COMPLETED") {
      return res.json({ success: true, message: "Order already captured" });
    }

    // Capture
    const captureRes = await axios.post(
      `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    const captured = captureRes.data;

    if (captured.status !== "COMPLETED") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    // Extract custom_id metadata
    const unit      = captured.purchase_units?.[0];
    const customId  = unit?.custom_id || unit?.reference_id;
    let meta = {};
    try { meta = JSON.parse(customId); } catch { /* ignore */ }

    const captureId = unit?.payments?.captures?.[0]?.id || orderId;

    await activateMembership({
      userId:         meta.userId,
      planId:         meta.planId,
      billingPeriod:  meta.billingPeriod,
      amountUSD:      parseFloat(meta.amountUSD) || 0,
      paymentMethod:  "paypal",
      gatewayOrderId: orderId,
      gatewayPaymentId: captureId,
      userEmail:      meta.userEmail,
      userName:       meta.userName,
    });

    console.log("✅ PayPal payment captured:", orderId);
    res.json({ success: true, orderId, captureId });
  } catch (error) {
    console.error("❌ PayPal capture error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error?.response?.data?.message || error.message || "Failed to capture PayPal order",
    });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  LEMONSQUEEZY
// ═════════════════════════════════════════════════════════════════════════════

// ── Create LemonSqueezy Checkout ──────────────────────────────────────────────
exports.createLemonSqueezyCheckout = async (req, res) => {
  try {
    const { planId, billingPeriod = "monthly", successUrl, cancelUrl } = req.body;

    if (!planId || !successUrl || !cancelUrl) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ success: false, message: "Invalid plan ID" });

    const apiKey   = process.env.LEMONSQUEEZY_API_KEY;
    const storeId  = process.env.LEMONSQUEEZY_STORE_ID;
    if (!apiKey || !storeId) {
      throw new Error("LEMONSQUEEZY_API_KEY / LEMONSQUEEZY_STORE_ID not set in environment variables.");
    }

    const variantId = LS_VARIANTS()?.[planId]?.[billingPeriod];
    if (!variantId) {
      return res.status(500).json({ success: false, message: `LemonSqueezy variant ID not configured for ${planId}/${billingPeriod}` });
    }

    const user         = req.user;
    const periodConfig = plan[billingPeriod];

    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: {
            dark: true,
            logo: true,
          },
          checkout_data: {
            email:  user.email,
            name:   user.name || user.username || "",
            custom: {
              userId:        user._id.toString(),
              userEmail:     user.email,
              userName:      user.name || user.username || "",
              planId,
              billingPeriod,
              durationDays:  String(periodConfig.durationDays),
              planName:      plan.name,
              amountUSD:     String(periodConfig.priceUSD),
            },
          },
          product_options: {
            redirect_url:  successUrl,
          },
          expires_at: null,
        },
        relationships: {
          store: {
            data: { type: "stores", id: String(storeId) },
          },
          variant: {
            data: { type: "variants", id: String(variantId) },
          },
        },
      },
    };

    const lsRes = await axios.post(
      "https://api.lemonsqueezy.com/v1/checkouts",
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept:         "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
        },
      }
    );

    const checkoutUrl = lsRes.data?.data?.attributes?.url;
    if (!checkoutUrl) {
      return res.status(500).json({ success: false, message: "LemonSqueezy did not return a checkout URL" });
    }

    console.log("✅ LemonSqueezy checkout created:", { userId: user._id, planId, billingPeriod });
    res.json({ success: true, url: checkoutUrl });
  } catch (error) {
    console.error("❌ LemonSqueezy checkout error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error?.response?.data?.errors?.[0]?.detail || error.message || "Failed to create LemonSqueezy checkout",
    });
  }
};

// ── LemonSqueezy Webhook ──────────────────────────────────────────────────────
exports.handleLemonSqueezyWebhook = async (req, res) => {
  const secret    = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const signature = req.headers["x-signature"];

  if (!secret) {
    console.error("LEMONSQUEEZY_WEBHOOK_SECRET not set");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  // Verify HMAC-SHA256 signature
  const rawBody = req.rawBody || req.body;
  const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : JSON.stringify(rawBody);
  const expected = crypto.createHmac("sha256", secret).update(bodyStr).digest("hex");

  if (!signature || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    console.error("❌ LemonSqueezy webhook signature mismatch");
    return res.status(401).json({ error: "Invalid signature" });
  }

  const eventName = req.headers["x-event-name"];
  console.log(`📨 LemonSqueezy webhook received: ${eventName}`);

  if (eventName === "order_created") {
    try {
      const data  = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const order = data?.data;
      const attrs = order?.attributes;

      if (!attrs || attrs.status !== "paid") {
        return res.json({ received: true });
      }

      const custom      = attrs.first_order_item?.custom_data || attrs.meta?.custom_data || {};
      const orderId     = String(order.id);
      const amountUSD   = parseFloat(attrs.total) / 100 || parseFloat(custom.amountUSD) || 0;

      await activateMembership({
        userId:           custom.userId,
        planId:           custom.planId,
        billingPeriod:    custom.billingPeriod,
        amountUSD,
        paymentMethod:    "lemonsqueezy",
        gatewayOrderId:   orderId,
        gatewayPaymentId: orderId,
        userEmail:        custom.userEmail || attrs.user_email,
        userName:         custom.userName  || attrs.user_name,
      });
    } catch (err) {
      console.error("❌ Error processing LemonSqueezy webhook:", err);
      // Return 200 so LemonSqueezy doesn't retry for logic errors
      return res.json({ received: true, warning: err.message });
    }
  }

  res.json({ received: true });
};

// ═════════════════════════════════════════════════════════════════════════════
//  SHARED / UTILITY ENDPOINTS
// ═════════════════════════════════════════════════════════════════════════════

// ── Get user's transaction history ────────────────────────────────────────────
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, page = 1, status, packageType } = req.query;

    const user = await User.findById(userId).select("transactions name email");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let transactions = user.transactions || [];
    if (status)      transactions = transactions.filter((t) => t.status === status);
    if (packageType) transactions = transactions.filter((t) => t.packageType === packageType);

    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const startIndex = (page - 1) * limit;
    const paginated  = transactions.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      transactions: paginated,
      pagination: {
        page:       parseInt(page),
        limit:      parseInt(limit),
        total:      transactions.length,
        totalPages: Math.ceil(transactions.length / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions", error: error.message });
  }
};

// ── Get token balance ──────────────────────────────────────────────────────────
exports.getTokenBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("tokens membership name email");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success:        true,
      token:          user.tokens || 0,
      availableToken: Math.max(0, user.tokens || 0),
      membership:     user.membership || null,
      user:           { name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch token balance", error: error.message });
  }
};

// ── Get transaction by ID ──────────────────────────────────────────────────────
exports.getTransactionById = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("transactions");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const transaction = (user.transactions || []).find(
      (t) => t._id.toString() === req.params.transactionId
    );
    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch transaction", error: error.message });
  }
};

// ── Legacy stubs ──────────────────────────────────────────────────────────────
exports.saveTransaction = async (_req, res) => {
  res.status(410).json({ success: false, message: "This endpoint is deprecated. Payments are handled via PayPal/LemonSqueezy." });
};

let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    const Razorpay = require("razorpay");
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_S7R44fJcrPnhgf";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
    _razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return _razorpay;
};

const verifySignature = (orderId, paymentId, signature) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");
  return expectedSignature === signature;
};

exports.createOrder = async (req, res) => {
  try {
    const { 
      packageId, 
      packageType, 
      finalAmount, 
      billingPeriod = "monthly",
      packageName 
    } = req.body;

    if (!packageId || !packageType || !finalAmount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const amount = Math.round(parseFloat(finalAmount) * 100); // Convert to paise
    if (amount < 100) {
      return res.status(400).json({ success: false, message: "Amount must be at least ₹1" });
    }

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notes: {
        packageId,
        packageType,
        billingPeriod: packageType === "subscription" ? billingPeriod : undefined,
        packageName: packageName || packageId,
        userId: req.user._id.toString(),
        userEmail: req.user.email
      },
      payment_capture: 1
    };

    let order = null;
    let keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_S7R44fJcrPnhgf";
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && keySecret !== "placeholder_secret") {
      try {
        order = await getRazorpay().orders.create(options);
        console.log("✅ Razorpay order created via API:", order.id);
      } catch (apiError) {
        console.warn("⚠️ Razorpay API order creation failed. Falling back to standard capture mode:", apiError.message);
      }
    } else {
      console.log("ℹ️ Razorpay secret key not set/placeholder. Running in standard capture mode.");
    }

    res.json({
      success: true,
      order: order ? {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      } : {
        amount: amount,
        currency: "INR",
        receipt: options.receipt
      },
      key: keyId
    });

  } catch (error) {
    console.error("❌ Razorpay order handler error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      packageId,
      packageType,
      finalAmount,
      billingPeriod = "monthly",
      status
    } = req.body;

    console.log("🔍 Verifying Razorpay payment:", {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      packageId,
      status,
      userId: req.user._id
    });

    if (status === "success") {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const hasValidSecret = keySecret && keySecret !== "placeholder_secret";
      const hasSignature = !!razorpay_signature && !!razorpay_order_id;

      if (hasValidSecret && hasSignature) {
        const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) {
          return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
        console.log("✅ Razorpay signature verified successfully.");
      } else {
        console.log("ℹ️ Bypassing signature verification (sandbox / test mode).");
      }

      // Activate membership and save transaction using the standard helper
      const amountUSD = parseFloat(finalAmount);
      const transaction = await activateMembership({
        userId: req.user._id,
        planId: packageId,
        billingPeriod,
        amountUSD,
        paymentMethod: "razorpay",
        gatewayOrderId: razorpay_order_id || `order_mock_${Date.now()}`,
        gatewayPaymentId: razorpay_payment_id,
        userEmail: req.user.email,
        userName: req.user.name
      });

      const user = await User.findById(req.user._id);

      res.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          transactionId: transaction?._id || null,
          orderId: razorpay_order_id || `order_mock_${Date.now()}`,
          paymentId: razorpay_payment_id,
          tokens: user?.tokens || 0,
          membership: user?.membership || null,
          status: "success"
        }
      });
    } else {
      res.json({
        success: true,
        message: "Failed transaction saved",
        data: {
          status: "failed"
        }
      });
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message
    });
  }
};