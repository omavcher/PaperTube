// routes/payment.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 Save transaction (both success and failed)
router.post("/save-transaction", authMiddleware, paymentController.saveTransaction);

// 🔹 Get user's transaction history
router.get("/transactions", authMiddleware, paymentController.getTransactions);

// 🔹 Get user token balance
router.get("/token-balance", authMiddleware, paymentController.getTokenBalance);

module.exports = router;