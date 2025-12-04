const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  signature: { type: String },
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  packageType: { type: String, enum: ['subscription', 'token'], default: 'token' },
  billingPeriod: { type: String, enum: ['monthly', 'yearly'], default: undefined },
  amount: { type: Number, required: true },
  baseAmount: { type: Number },
  discountAmount: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  tokens: { type: Number, default: 0 },
  status: { type: String, enum: ['success', 'failed'], required: true },
  couponCode: { type: String },
  packageMeta: { type: mongoose.Schema.Types.Mixed, default: {} },
  razorpay_payment_id: { type: String },
  razorpay_order_id: { type: String },
  razorpay_signature: { type: String },
  error: { type: String },
  paymentMethod: { type: String },
  userEmail: { type: String },
  userName: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const TokenUsageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  tokens: { type: Number, required: true },
});

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: false,
      trim: true,
    },
    picture: {
      type: String,
      default: "",
    },
    token: {
      type: Number,
      default: 100,
      min: 0,
    },
    usedToken: {
      type: Number,
      default: 0,
      min: 0,
    },
    isNewUser: {
      type: Boolean,
      default: true
    },
    lastTokenReset: {
      type: Date,
      default: Date.now
    },
    transactions: [TransactionSchema],
    tokenUsageHistory: [TokenUsageSchema],
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    tokenTransactions: [
      {
        name: { type: String },
        type: { type: String },
        tokensUsed: { type: Number },
        date: { type: Date, default: Date.now },
        status: { type: String, default: "success" },
      },
    ],    
    notes: [
      {
        noteId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Note",
        },
      },
    ],
    membership: {
      isActive: { type: Boolean, default: false },
      planId: { type: String },
      planName: { type: String },
      billingPeriod: { type: String, enum: ['monthly', 'yearly'], default: undefined },
      startedAt: { type: Date },
      expiresAt: { type: Date },
      lastPaymentId: { type: String },
      autoRenew: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);