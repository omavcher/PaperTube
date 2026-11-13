// routes/paymentRoutes.js — PayPal + LemonSqueezy
const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");
const paymentController = require("../controllers/paymentController");
const authMiddleware    = require("../middleware/authMiddleware");
const { couponRouter }  = require("../coupon");

// ── Coupon Validation (Rate-Limited) ──────────────────────────────────────────
router.use("/", couponRouter);

// Optional auth for capture/sync so token expiry or redirection never blocks activating a paid subscription
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Auth") || req.header("Authorization");
    if (!authHeader) return next();
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    if (!token || token === "null" || token === "undefined") return next();
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    if (decoded?.id) {
      const user = await User.findById(decoded.id).select("-__v");
      if (user) req.user = user;
    }
    next();
  } catch {
    next();
  }
};

// ── PayPal ────────────────────────────────────────────────────────────────────
// Public config: returns current PayPal client ID, mode, and currency
router.get("/paypal/config", paymentController.getPaypalConfig);
// Step 1: Create a PayPal order → returns orderId + approvalUrl (requires auth)
router.post("/paypal/create-order", authMiddleware, paymentController.createPaypalOrder);
// Step 2: Capture the approved PayPal order → activates membership (uses optionalAuth for resilience)
router.post("/paypal/capture-order", optionalAuth, paymentController.capturePaypalOrder);
// Step 3: PayPal webhook (no auth — verified via order ID & status lookup)
router.post("/paypal/webhook", paymentController.handlePaypalWebhook);
// Step 4: Sync/recover PayPal order manually
router.post("/paypal/sync-order", optionalAuth, paymentController.syncPaypalOrder);

// ── LemonSqueezy ──────────────────────────────────────────────────────────────
// Create a hosted checkout session → returns checkout URL (requires auth)
router.post("/lemonsqueezy/create-checkout", authMiddleware, paymentController.createLemonSqueezyCheckout);
// LemonSqueezy webhook (no auth — verified via HMAC signature in controller)
router.post("/lemonsqueezy/webhook", paymentController.handleLemonSqueezyWebhook);

// ── Paytm (UPI / All-in-One Gateway) ──────────────────────────────────────────
// Public config: returns Paytm MID and environment mode
router.get("/paytm/config", paymentController.getPaytmConfig);
// Step 1: Initiate Paytm transaction → returns txnToken + orderId (requires auth)
router.post("/paytm/initiate", authMiddleware, paymentController.initiatePaytmTransaction);
// Step 2: Verify Paytm transaction (frontend JS callback verify)
router.post("/paytm/verify", authMiddleware, paymentController.verifyPaytmTransaction);
// Step 3: Cancel Paytm transaction (user closed or dismissed modal)
router.post("/paytm/cancel", authMiddleware, paymentController.cancelPaytmTransaction);
// Step 4: Sync / recover Paytm order (re-query order status API)
router.post("/paytm/sync-order", optionalAuth, paymentController.syncPaytmOrder);
// Step 5: Paytm callback (POST and GET from Paytm server / browser redirect)
router.post("/paytm/callback", paymentController.handlePaytmCallback);
router.get("/paytm/callback", paymentController.handlePaytmCallback);

// Step 6: Paytm Server-to-Server Webhooks (configured in Paytm Developer Dashboard)
// Payment Notification URL (S2S completion webhook)
router.post("/paytm/webhook", paymentController.handlePaytmWebhook);
router.get("/paytm/webhook", paymentController.handlePaytmWebhook);
// Success Refund Notify & Accept Refund Notify
router.post("/paytm/refund-notify", paymentController.handlePaytmRefundWebhook);
router.get("/paytm/refund-notify", paymentController.handlePaytmRefundWebhook);
// Charge Back Notify
router.post("/paytm/chargeback-notify", paymentController.handlePaytmDisputeWebhook);
router.get("/paytm/chargeback-notify", paymentController.handlePaytmDisputeWebhook);
// Subscription Pre notify
router.post("/paytm/subscription-pre-notify", paymentController.handlePaytmPreNotifyWebhook);
router.get("/paytm/subscription-pre-notify", paymentController.handlePaytmPreNotifyWebhook);

// ── Transaction History ────────────────────────────────────────────────────────
router.get("/transactions",                    authMiddleware, paymentController.getTransactions);
router.get("/token-balance",                   authMiddleware, paymentController.getTokenBalance);
router.get("/transaction/:transactionId",      authMiddleware, paymentController.getTransactionById);

// ── Legacy (Razorpay) ─────────────────────────────────────────────────────────
router.post("/create-order",        authMiddleware, paymentController.createOrder);
router.post("/verify",              authMiddleware, paymentController.verifyPayment);
router.post("/save-transaction",    authMiddleware, paymentController.saveTransaction);

module.exports = router;