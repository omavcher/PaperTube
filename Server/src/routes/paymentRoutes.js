// routes/paymentRoutes.js — PayPal + LemonSqueezy
const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");
const paymentController = require("../controllers/paymentController");
const authMiddleware    = require("../middleware/authMiddleware");

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

// ── Transaction History ────────────────────────────────────────────────────────
router.get("/transactions",                    authMiddleware, paymentController.getTransactions);
router.get("/token-balance",                   authMiddleware, paymentController.getTokenBalance);
router.get("/transaction/:transactionId",      authMiddleware, paymentController.getTransactionById);

// ── Legacy (Razorpay) ─────────────────────────────────────────────────────────
router.post("/create-order",        authMiddleware, paymentController.createOrder);
router.post("/verify",              authMiddleware, paymentController.verifyPayment);
router.post("/save-transaction",    authMiddleware, paymentController.saveTransaction);

module.exports = router;