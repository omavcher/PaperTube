// routes/payment.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// Create Razorpay order
router.post("/create-order", authMiddleware, paymentController.createOrder);

// Verify payment and save transaction
router.post("/verify", authMiddleware, paymentController.verifyPayment);

// Save transaction (both success and failed)
router.post("/save-transaction", authMiddleware, paymentController.saveTransaction);

// Get user's transaction history
router.get("/transactions", authMiddleware, paymentController.getTransactions);

// Get user token balance
router.get("/token-balance", authMiddleware, paymentController.getTokenBalance);

// Get transaction by ID
router.get("/transaction/:transactionId", authMiddleware, paymentController.getTransactionById);

module.exports = router;