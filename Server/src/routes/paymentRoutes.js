// routes/paymentRoutes.js — PayPal + LemonSqueezy
const express = require("express");
const router  = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware    = require("../middleware/authMiddleware");

// ── PayPal ────────────────────────────────────────────────────────────────────
// Step 1: Create a PayPal order → returns orderId + approvalUrl (requires auth)
router.post("/paypal/create-order", authMiddleware, paymentController.createPaypalOrder);
// Step 2: Capture the approved PayPal order → activates membership (requires auth)
router.post("/paypal/capture-order", authMiddleware, paymentController.capturePaypalOrder);

// ── LemonSqueezy ──────────────────────────────────────────────────────────────
// Create a hosted checkout session → returns checkout URL (requires auth)
router.post("/lemonsqueezy/create-checkout", authMiddleware, paymentController.createLemonSqueezyCheckout);
// LemonSqueezy webhook (no auth — verified via HMAC signature in controller)
router.post("/lemonsqueezy/webhook", paymentController.handleLemonSqueezyWebhook);

// ── Transaction History ────────────────────────────────────────────────────────
router.get("/transactions",                    authMiddleware, paymentController.getTransactions);
router.get("/token-balance",                   authMiddleware, paymentController.getTokenBalance);
router.get("/transaction/:transactionId",      authMiddleware, paymentController.getTransactionById);

// ── Legacy (Razorpay) — returns 410 Gone ──────────────────────────────────────
router.post("/create-order",        authMiddleware, paymentController.createOrder);
router.post("/verify",              authMiddleware, paymentController.verifyPayment);
router.post("/save-transaction",    authMiddleware, paymentController.saveTransaction);

module.exports = router;