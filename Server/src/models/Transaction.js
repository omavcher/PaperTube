// models/Transaction.js
const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  paymentId:              { type: String, required: true },
  orderId:                { type: String, required: true },
  // Gateway-specific IDs (only one will be set per transaction)
  paypalOrderId:          { type: String, default: null },
  lemonSqueezyOrderId:    { type: String, default: null },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  packageId:        { type: String, required: true },
  packageName:      { type: String, required: true },
  packageType:      { type: String, enum: ["subscription", "token"], default: "subscription" },
  billingPeriod:    { type: String, enum: ["monthly", "yearly"], default: "monthly" },
  amount:           { type: Number, required: true },
  baseAmount:       { type: Number, default: 0 },
  discountAmount:   { type: Number, default: 0 },
  gstAmount:        { type: Number, default: 0 },
  status:           { type: String, enum: ["success", "failed", "pending"], required: true },
  paymentMethod:    { type: String, enum: ["paypal", "lemonsqueezy", "razorpay"], default: "paypal" },
  couponCode:       { type: String, default: null },
  userEmail:        { type: String },
  userName:         { type: String },
  timestamp:        { type: Date, default: Date.now },
});

module.exports = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);