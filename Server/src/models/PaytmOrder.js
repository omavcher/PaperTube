const mongoose = require("mongoose");

const PaytmOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: String,
      required: true,
      default: "pro",
    },
    billingPeriod: {
      type: String,
      required: true,
      default: "monthly",
    },
    amountINR: {
      type: Number,
      required: true,
    },
    baseAmount: {
      type: Number,
      default: null,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    couponCode: {
      type: String,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    txnToken: {
      type: String,
      default: null,
    },
    userEmail: {
      type: String,
      default: null,
    },
    userName: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["created", "pending", "success", "failed", "cancelled"],
      default: "created",
      index: true,
    },
    resultCode: {
      type: String,
      default: null,
    },
    resultMsg: {
      type: String,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
    txnId: {
      type: String,
      default: null,
    },
    bankTxnId: {
      type: String,
      default: null,
    },
    paymentMode: {
      type: String, // UPI, CC, DC, NB, PPI
      default: null,
    },
    gatewayName: {
      type: String,
      default: null,
    },
    bankName: {
      type: String,
      default: null,
    },
    checksumHash: {
      type: String,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    lastCheckedAt: {
      type: Date,
      default: Date.now,
    },
    rawResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.PaytmOrder || mongoose.model("PaytmOrder", PaytmOrderSchema);

