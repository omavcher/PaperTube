const mongoose = require("mongoose");

const PaypalOrderSchema = new mongoose.Schema(
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
    amountUSD: {
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
    userEmail: {
      type: String,
      default: null,
    },
    userName: {
      type: String,
      default: null,
    },
    // created   -> order created in PayPal, not yet captured
    // captured  -> PayPal took the money, activation not confirmed yet (danger zone)
    // activated -> membership successfully activated, fully done
    // failed    -> capture failed or was cancelled
    status: {
      type: String,
      enum: ["created", "captured", "activated", "failed"],
      default: "created",
      index: true,
    },
    captureId: {
      type: String,
      default: null,
    },
    lastError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.PaypalOrder || mongoose.model("PaypalOrder", PaypalOrderSchema);
