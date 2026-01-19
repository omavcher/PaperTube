// models/Transaction.js
const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  packageType: { type: String, enum: ['subscription', 'token'], default: 'token' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['success', 'failed', 'pending'], required: true },
  userEmail: { type: String },
  userName: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);