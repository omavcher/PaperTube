// controllers/paymentController.js — PayPal + LemonSqueezy
const axios = require("axios");
const crypto = require("crypto");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const PaypalOrder = require("../models/PaypalOrder");
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
  const normPlanId = (planId || "pro").toLowerCase();
  const plan = PLANS[normPlanId] || PLANS.pro;
  const normBilling = (billingPeriod || "monthly").toLowerCase();
  const periodConfig = plan[normBilling] || plan.monthly;
  const durationDays = periodConfig.durationDays || 30;
  const planName     = plan.name || "Pro";

  let user = null;
  if (userId) {
    user = await User.findById(userId);
  }
  if (!user && userEmail) {
    user = await User.findOne({ email: userEmail.toLowerCase().trim() });
  }
  if (!user) {
    throw new Error(`User not found for subscription activation: ${userId || userEmail}`);
  }

  // Idempotency — check if already processed with same gateway order id or payment id
  const alreadyDone = (user.transactions || []).some(
    (t) => (t.orderId === gatewayOrderId || t.paypalOrderId === gatewayOrderId || t.lemonSqueezyOrderId === gatewayOrderId || t.paymentId === gatewayPaymentId) && t.status === "success"
  );
  if (alreadyDone) {
    console.log(`ℹ️  Order ${gatewayOrderId} already processed for ${user.email} — verifying active status.`);
    if (!user.membership?.isActive) {
      user.membership.isActive = true;
      await user.save();
    }
    return user.transactions.find(t => t.orderId === gatewayOrderId || t.paypalOrderId === gatewayOrderId) || null;
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
    planId:        normPlanId,
    planName,
    billingPeriod: normBilling,
    startedAt:     user.membership?.startedAt || now,
    expiresAt,
    lastPaymentId: gatewayPaymentId || gatewayOrderId,
    autoRenew:     false,
  };

  const isPower = normPlanId.includes("power");
  const allocatedUnits = isPower ? 4500 : 1500;
  user.aiCapacity = {
    usedUnits: 0,
    allocatedUnits,
    hardCostUSD: 0,
    imagesGenerated: 0,
    lastReset: now,
  };
  user.tokens = allocatedUnits;
  user.rank = isPower ? "power" : "pro";

  // ── Build transaction record ───────────────────────────────────────────────
  const transactionRecord = {
    userId:              user._id,
    paymentId:           gatewayPaymentId || gatewayOrderId,
    orderId:             gatewayOrderId,
    paypalOrderId:       paymentMethod === "paypal"        ? gatewayOrderId : null,
    lemonSqueezyOrderId: paymentMethod === "lemonsqueezy"  ? gatewayOrderId : null,
    packageId:           normPlanId,
    packageName:         `${planName} (${normBilling})`,
    packageType:         "subscription",
    billingPeriod:       normBilling,
    amount:              amountUSD || periodConfig.priceUSD,
    baseAmount:          amountUSD || periodConfig.priceUSD,
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
  await user.save({ validateModifiedOnly: true });

  console.log(`✅ Membership ACTIVATED for ${user.email}: ${planName} (${normBilling}) until ${expiresAt.toISOString()}`);

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

// Helper to extract detailed error messages from PayPal API responses
function getDetailedPaypalError(error) {
  if (error?.response?.data) {
    const data = error.response.data;
    if (data.details && Array.isArray(data.details)) {
      return data.details.map(d => `${d.issue}: ${d.description}`).join("; ") || data.message;
    }
    return data.error_description || data.message || data.error || JSON.stringify(data);
  }
  return error.message;
}

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

// ── PayPal Public Config (so frontend loads matching client ID and mode) ────
exports.getPaypalConfig = async (req, res) => {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const mode     = process.env.PAYPAL_MODE || "sandbox";
    res.json({
      success: true,
      clientId: clientId || null,
      mode,
      currency: "USD",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Create PayPal Order (used by JS SDK on frontend — includes return_url for mobile) ────
exports.createPaypalOrder = async (req, res) => {
  try {
    const { planId, billingPeriod = "monthly" } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, message: "Missing planId" });
    }
    const normPlanId = planId.toLowerCase();
    const plan = PLANS[normPlanId];
    if (!plan) return res.status(400).json({ success: false, message: "Invalid plan ID" });

    const normBilling  = (billingPeriod || "monthly").toLowerCase();
    const periodConfig = plan[normBilling] || plan.monthly;
    const priceUSD     = periodConfig.priceUSD;
    const user         = req.user;

    const { token, baseUrl } = await getPaypalAccessToken();

    const clientBaseUrl = process.env.CLIENT_URL || "https://paperxify.com";

    // Compact fallback custom_id (< 256 char limit)
    const compactCustomId = JSON.stringify({
      userId:        user._id.toString(),
      planId:        normPlanId,
      billingPeriod: normBilling,
    });

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `${normPlanId}___${normBilling}___${user._id}`,
          description:  `PaperXify ${plan.name} — ${normBilling === "monthly" ? "Monthly" : "Yearly"}`,
          amount: {
            currency_code: "USD",
            value:         priceUSD.toFixed(2),
          },
          custom_id: compactCustomId,
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "PaperXify",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
            return_url: `${clientBaseUrl}/payment/paypal/return`,
            cancel_url: `${clientBaseUrl}/pricing?canceled=true`,
          },
        },
      },
    };

    const orderRes = await axios.post(`${baseUrl}/v2/checkout/orders`, orderPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const order = orderRes.data;

    // Source of truth for capture lives in OUR DB, not round-tripped through PayPal
    await PaypalOrder.findOneAndUpdate(
      { orderId: order.id },
      {
        orderId:       order.id,
        userId:        user._id,
        planId:        normPlanId,
        billingPeriod: normBilling,
        amountUSD:     priceUSD,
        userEmail:     user.email,
        userName:      user.name || user.username || "",
        status:        "created",
      },
      { upsert: true, new: true }
    );

    console.log("✅ PayPal order created and saved to DB:", { orderId: order.id, userId: user._id, planId: normPlanId, billingPeriod: normBilling });

    res.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("❌ PayPal create order error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: getDetailedPaypalError(error),
    });
  }
};

// ── Capture PayPal Order (called from frontend onApprove or redirect return page) ────────────
exports.capturePaypalOrder = async (req, res) => {
  try {
    const { orderId, planId: bodyPlanId, billingPeriod: bodyBillingPeriod } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: "Missing orderId" });

    // 1. Pull trusted metadata from OUR DB first — not from PayPal custom_id
    let pending = await PaypalOrder.findOne({ orderId });

    // True idempotency — governed by OUR status, never short-circuiting before activation
    if (pending && pending.status === "activated") {
      const activeUser = await User.findById(pending.userId).select("-password -__v -googleAccessToken -googleId -followerUsers");
      return res.json({
        success: true,
        message: "Subscription already active.",
        orderId,
        captureId: pending.captureId || orderId,
        user: activeUser,
        membership: activeUser?.membership,
      });
    }

    const { token, baseUrl } = await getPaypalAccessToken();

    // 2. Fetch current order details from PayPal
    let order = null;
    try {
      const orderRes = await axios.get(`${baseUrl}/v2/checkout/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      order = orderRes.data;
    } catch (fetchErr) {
      console.error("❌ PayPal get order error:", fetchErr?.response?.data || fetchErr.message);
      return res.status(404).json({ success: false, message: getDetailedPaypalError(fetchErr) });
    }

    // If no PaypalOrder existed yet (legacy order or direct checkout), reconstruct and save to DB
    if (!pending) {
      const getUnit = order?.purchase_units?.[0];
      let meta = {};
      if (getUnit?.custom_id) {
        try { meta = JSON.parse(getUnit.custom_id); } catch {}
      }
      if (!meta.userId && getUnit?.reference_id) {
        const parts = getUnit.reference_id.split("___");
        if (parts.length >= 3) {
          meta.planId = parts[0];
          meta.billingPeriod = parts[1];
          meta.userId = parts[2];
        }
      }

      const targetUserId = req.user?._id || meta.userId;
      let matchedUser = null;
      if (targetUserId) {
        matchedUser = await User.findById(targetUserId);
      }
      if (!matchedUser && (meta.userEmail || order.payer?.email_address)) {
        matchedUser = await User.findOne({
          email: (meta.userEmail || order.payer?.email_address).toLowerCase().trim()
        });
      }

      if (!matchedUser) {
        return res.status(400).json({ success: false, message: "Could not identify user account for this PayPal order." });
      }

      const planId = (meta.planId || bodyPlanId || "pro").toLowerCase();
      const billingPeriod = (meta.billingPeriod || bodyBillingPeriod || "monthly").toLowerCase();
      const planConfig = PLANS[planId] || PLANS.pro;
      const periodConf = planConfig[billingPeriod] || planConfig.monthly;
      const amountUSD = parseFloat(meta.amountUSD) || parseFloat(getUnit?.amount?.value) || periodConf.priceUSD;

      pending = await PaypalOrder.findOneAndUpdate(
        { orderId },
        {
          orderId,
          userId: matchedUser._id,
          planId,
          billingPeriod,
          amountUSD,
          userEmail: matchedUser.email,
          userName: matchedUser.name || matchedUser.username || "",
          status: "created",
        },
        { upsert: true, new: true }
      );
    }

    let captureId = pending.captureId || orderId;
    let isCompleted = order?.status === "COMPLETED";

    // 3. If not already completed, capture it now via PayPal API
    if (!isCompleted) {
      try {
        const captureRes = await axios.post(
          `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
          {},
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        const captured = captureRes.data;
        if (captured.status === "COMPLETED") {
          isCompleted = true;
          const capUnit = captured.purchase_units?.[0];
          captureId = capUnit?.payments?.captures?.[0]?.id || orderId;
        } else {
          pending.status = "failed";
          pending.lastError = `PayPal status: ${captured.status}`;
          await pending.save();
          return res.status(400).json({ success: false, message: `PayPal payment status: ${captured.status}` });
        }
      } catch (capErr) {
        const errDetail = capErr?.response?.data;
        const isAlreadyCaptured = errDetail?.details?.some((d) => d.issue === "ORDER_ALREADY_CAPTURED");
        if (isAlreadyCaptured) {
          console.log(`ℹ️ Order ${orderId} was already captured on PayPal.`);
          isCompleted = true;
        } else {
          pending.lastError = getDetailedPaypalError(capErr);
          await pending.save();
          console.error("❌ PayPal capture call error:", errDetail || capErr.message);
          return res.status(400).json({ success: false, message: getDetailedPaypalError(capErr) });
        }
      }
    }

    // Mark "captured" in our DB immediately — money is confirmed taken by PayPal!
    // Every code path below MUST end in activation, never a silent skip.
    pending.status = "captured";
    pending.captureId = captureId;
    pending.updatedAt = new Date();
    await pending.save();

    // 4. Activate membership
    try {
      const transaction = await activateMembership({
        userId:           pending.userId,
        planId:           pending.planId,
        billingPeriod:    pending.billingPeriod,
        amountUSD:        pending.amountUSD,
        paymentMethod:    "paypal",
        gatewayOrderId:   orderId,
        gatewayPaymentId: captureId,
        userEmail:        pending.userEmail,
        userName:         pending.userName,
      });

      // Mark activated in our DB — ONLY done when activateMembership actually succeeds!
      pending.status = "activated";
      pending.lastError = null;
      await pending.save();

      const activeUser = await User.findById(pending.userId).select("-password -__v -googleAccessToken -googleId -followerUsers");

      console.log("✅ PayPal payment captured + activated:", orderId, "for user:", activeUser?.email);
      return res.json({
        success: true,
        message: "Subscription activated successfully!",
        orderId,
        captureId,
        transaction,
        user: activeUser,
        membership: activeUser?.membership,
      });
    } catch (activationErr) {
      // Money IS taken. Activation failed. Leave status as "captured" (NOT "activated")
      // so the next retry will try activateMembership again instead of short-circuiting!
      pending.lastError = activationErr.message;
      await pending.save();
      console.error(`🚨 PAID BUT NOT ACTIVATED — orderId=${orderId} userId=${pending.userId}:`, activationErr.message);
      return res.status(500).json({
        success: false,
        message: "Payment received by PayPal, activating your plan. If not updated shortly, please click Sync PayPal in Profile or contact support with Order ID: " + orderId,
      });
    }
  } catch (error) {
    console.error("❌ PayPal capture error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: getDetailedPaypalError(error),
    });
  }
};

// ── Sync PayPal Order (idempotent manual/auto recovery endpoint) ─────────────
exports.syncPaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Missing orderId" });
    }

    // Check our DB first
    const pending = await PaypalOrder.findOne({ orderId });
    if (pending && pending.status === "activated") {
      const activeUser = await User.findById(pending.userId).select("-password -__v -googleAccessToken -googleId -followerUsers");
      return res.json({
        success: true,
        message: "Subscription is already active.",
        orderId,
        user: activeUser,
        membership: activeUser?.membership,
      });
    }

    // Delegate to capturePaypalOrder to verify PayPal status and activate
    return await exports.capturePaypalOrder(req, res);
  } catch (error) {
    console.error("❌ PayPal sync error:", error?.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PayPal Webhook (auto-captures and auto-activates if user closes window) ────
exports.handlePaypalWebhook = async (req, res) => {
  try {
    const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const eventType = event.event_type;
    console.log(`📨 PayPal webhook received: ${eventType} (ID: ${event.id})`);

    const { token, baseUrl } = await getPaypalAccessToken();

    if (eventType === "CHECKOUT.ORDER.APPROVED") {
      const orderResource = event.resource || {};
      const orderId = orderResource.id;
      console.log(`⚡ Auto-capturing approved order via webhook: ${orderId}`);

      let pending = await PaypalOrder.findOne({ orderId });
      if (pending && pending.status === "activated") {
        console.log(`ℹ️ Webhook: Order ${orderId} already activated in DB.`);
        return res.status(200).json({ received: true });
      }

      try {
        const captureRes = await axios.post(
          `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
          {},
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        const captured = captureRes.data;
        const capUnit = captured.purchase_units?.[0];
        const captureId = capUnit?.payments?.captures?.[0]?.id || orderId;

        if (pending) {
          pending.status = "captured";
          pending.captureId = captureId;
          await pending.save();

          await activateMembership({
            userId:           pending.userId,
            planId:           pending.planId,
            billingPeriod:    pending.billingPeriod,
            amountUSD:        pending.amountUSD,
            paymentMethod:    "paypal",
            gatewayOrderId:   orderId,
            gatewayPaymentId: captureId,
            userEmail:        pending.userEmail,
            userName:         pending.userName,
          });

          pending.status = "activated";
          pending.lastError = null;
          await pending.save();
          console.log(`✅ Webhook auto-captured and activated membership for order ${orderId}`);
        } else {
          // Fallback if order not in DB
          let meta = {};
          if (capUnit?.custom_id) {
            try { meta = JSON.parse(capUnit.custom_id); } catch {}
          }
          const userEmail = meta.userEmail || orderResource.payer?.email_address;
          const userName  = meta.userName  || `${orderResource.payer?.name?.given_name || ""} ${orderResource.payer?.name?.surname || ""}`.trim();

          await activateMembership({
            userId:           meta.userId,
            planId:           meta.planId || "pro",
            billingPeriod:    meta.billingPeriod || "monthly",
            amountUSD:        parseFloat(meta.amountUSD) || parseFloat(capUnit?.amount?.value) || 0,
            paymentMethod:    "paypal",
            gatewayOrderId:   orderId,
            gatewayPaymentId: captureId,
            userEmail,
            userName,
          });
        }
      } catch (capErr) {
        console.error("❌ Webhook order capture error:", capErr?.response?.data || capErr.message);
      }
    } else if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = event.resource || {};
      const orderId = resource.supplementary_data?.related_ids?.order_id || resource.id;
      const captureId = resource.id;

      let pending = await PaypalOrder.findOne({ orderId });
      if (pending && pending.status === "activated") {
        console.log(`ℹ️ Webhook: Order ${orderId} already activated.`);
        return res.status(200).json({ received: true });
      }

      if (pending) {
        pending.status = "captured";
        pending.captureId = captureId;
        await pending.save();

        await activateMembership({
          userId:           pending.userId,
          planId:           pending.planId,
          billingPeriod:    pending.billingPeriod,
          amountUSD:        pending.amountUSD,
          paymentMethod:    "paypal",
          gatewayOrderId:   orderId,
          gatewayPaymentId: captureId,
          userEmail:        pending.userEmail,
          userName:         pending.userName,
        });

        pending.status = "activated";
        pending.lastError = null;
        await pending.save();
        console.log(`✅ Webhook activated membership via PaypalOrder record: ${orderId}`);
      } else {
        let meta = {};
        if (resource.custom_id) {
          try { meta = JSON.parse(resource.custom_id); } catch {}
        }
        if (!meta.userId && orderId) {
          try {
            const orderRes = await axios.get(`${baseUrl}/v2/checkout/orders/${orderId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const unit = orderRes.data?.purchase_units?.[0];
            if (unit?.custom_id) {
              try { meta = JSON.parse(unit.custom_id); } catch {}
            }
          } catch (fetchErr) {
            console.warn("Webhook could not fetch order details for capture:", fetchErr.message);
          }
        }

        const userEmail = meta.userEmail || resource.payer?.email_address;
        const userName  = meta.userName;

        if (meta.userId || userEmail) {
          await activateMembership({
            userId:           meta.userId,
            planId:           meta.planId || "pro",
            billingPeriod:    meta.billingPeriod || "monthly",
            amountUSD:        parseFloat(meta.amountUSD) || parseFloat(resource.amount?.value) || 0,
            paymentMethod:    "paypal",
            gatewayOrderId:   orderId,
            gatewayPaymentId: captureId,
            userEmail,
            userName,
          });
          console.log(`✅ PayPal Webhook activated membership for: ${userEmail || meta.userId}`);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ PayPal webhook error:", err.message);
    res.status(200).json({ received: true, warning: err.message });
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

// ── Manual Sync / Recovery Endpoint for PayPal ──────────────────────────────
exports.syncPaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Missing orderId" });
    }

    const { token, baseUrl } = await getPaypalAccessToken();
    const orderRes = await axios.get(`${baseUrl}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const order = orderRes.data;

    const unit = order?.purchase_units?.[0];
    let meta = {};
    if (unit?.custom_id) {
      try { meta = JSON.parse(unit.custom_id); } catch {}
    }
    if (!meta.userId && unit?.reference_id) {
      const parts = unit.reference_id.split("___");
      if (parts.length >= 3) {
        meta.planId = parts[0];
        meta.billingPeriod = parts[1];
        meta.userId = parts[2];
      }
    }

    let captureId = orderId;
    let isCompleted = order.status === "COMPLETED";

    if (order.status === "APPROVED") {
      try {
        const capRes = await axios.post(
          `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
          {},
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        if (capRes.data?.status === "COMPLETED") {
          isCompleted = true;
          captureId = capRes.data.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId;
        }
      } catch (capErr) {
        const errDetail = capErr?.response?.data;
        if (errDetail?.details?.some(d => d.issue === "ORDER_ALREADY_CAPTURED")) {
          isCompleted = true;
        } else {
          return res.status(400).json({ success: false, message: getDetailedPaypalError(capErr) });
        }
      }
    }

    if (isCompleted || order.status === "COMPLETED") {
      const targetUserId = req.user?._id || meta.userId;
      const targetUserEmail = req.user?.email || meta.userEmail || order.payer?.email_address;
      const targetUserName = req.user?.name || meta.userName || `${order.payer?.name?.given_name || ""} ${order.payer?.name?.surname || ""}`.trim();
      const targetPlanId = meta.planId || "pro";
      const targetBilling = meta.billingPeriod || "monthly";

      const transaction = await activateMembership({
        userId: targetUserId,
        planId: targetPlanId,
        billingPeriod: targetBilling,
        amountUSD: parseFloat(meta.amountUSD) || parseFloat(unit?.amount?.value) || 0,
        paymentMethod: "paypal",
        gatewayOrderId: orderId,
        gatewayPaymentId: captureId,
        userEmail: targetUserEmail,
        userName: targetUserName,
      });

      const activeUser = await User.findOne({
        $or: [
          ...(targetUserId ? [{ _id: targetUserId }] : []),
          ...(targetUserEmail ? [{ email: targetUserEmail.toLowerCase().trim() }] : [])
        ]
      }).select('-password -__v -googleAccessToken -googleId -followerUsers');

      return res.json({
        success: true,
        message: "Subscription synced and activated successfully!",
        transaction,
        user: activeUser,
        membership: activeUser?.membership
      });
    }

    res.status(400).json({ success: false, message: `PayPal order status is ${order.status}. Order must be APPROVED or COMPLETED.` });
  } catch (error) {
    console.error("❌ Sync PayPal order error:", error?.response?.data || error.message);
    res.status(500).json({ success: false, message: getDetailedPaypalError(error) });
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

    const amount = Math.round(parseFloat(finalAmount) * 100); // Convert to cents/paise
    if (amount < 100) {
      return res.status(400).json({ success: false, message: "Amount must be at least $1" });
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
      let amountUSD = parseFloat(finalAmount);
      const plan = PLANS[packageId];
      if (plan && plan[billingPeriod]) {
        amountUSD = plan[billingPeriod].priceUSD;
      }

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