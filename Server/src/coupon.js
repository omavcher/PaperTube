// Server/src/coupon.js — Coupon backend for Paperxify (Express + Mongoose, CommonJS)
const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("./middleware/authMiddleware");
const { getPlanPrice } = require("./pricing");

// ─── 1. Models ───────────────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, default: "" },
    description: { type: String, default: "" },

    // Discount type & value
    type: { type: String, enum: ["percent", "flat"], required: true, default: "percent" },
    discountType: { type: String, enum: ["percent", "flat"] },
    percent: { type: Number, min: 1, max: 100 }, // when type = "percent"
    discountValue: { type: Number, default: 0 },

    // Discount caps and flat amounts
    maxDiscount: {
      INR: { type: Number, default: null },
      USD: { type: Number, default: null },
    },
    maxDiscountCap: { type: Number, default: 0 },
    flat: {
      INR: { type: Number, default: 0 },
      USD: { type: Number, default: 0 },
    },
    minOrderAmount: { type: Number, default: 0 },

    // Restrictions
    plans: { type: [String], default: [] }, // [] = all, or ["pro"], ["power"]
    restrictedToPlans: { type: [String], default: [] },
    applicableTo: { type: String, default: "all" }, // "all" | "subscription" | "token"
    billingPeriods: { type: [String], default: [] }, // [] = both, or ["monthly"], ["yearly"]

    // Validity & Limits
    validFrom: { type: Date, default: null },
    validTo: { type: Date, default: null },
    validUntil: { type: Date, default: null },
    maxRedemptions: { type: Number, default: null }, // null = unlimited
    maxUsageLimit: { type: Number, default: null },
    redeemedCount: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },

    // Status
    active: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },

    // Admin audit trail
    usedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        usedAt: { type: Date, default: Date.now },
        timesUsed: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to synchronize redundant/alias fields
couponSchema.pre("save", function (next) {
  // Sync type & discountType
  if (this.type && !this.discountType) this.discountType = this.type;
  if (this.discountType && !this.type) this.type = this.discountType;

  // Sync percent & discountValue
  if (this.type === "percent" && this.percent && !this.discountValue) {
    this.discountValue = this.percent;
  }
  if (this.type === "percent" && this.discountValue && !this.percent) {
    this.percent = this.discountValue;
  }

  // Sync flat & discountValue
  if (this.type === "flat") {
    if (this.discountValue && (!this.flat.INR && !this.flat.USD)) {
      this.flat.INR = this.discountValue;
      this.flat.USD = this.discountValue;
    }
  }

  // Sync plans & restrictedToPlans
  if (this.plans && this.plans.length > 0 && (!this.restrictedToPlans || this.restrictedToPlans.length === 0)) {
    this.restrictedToPlans = this.plans;
  }
  if (this.restrictedToPlans && this.restrictedToPlans.length > 0 && (!this.plans || this.plans.length === 0)) {
    this.plans = this.restrictedToPlans;
  }

  // Sync validity
  if (this.validTo && !this.validUntil) this.validUntil = this.validTo;
  if (this.validUntil && !this.validTo) this.validTo = this.validUntil;

  // Sync usage limits
  if (this.maxRedemptions != null && this.maxUsageLimit == null) this.maxUsageLimit = this.maxRedemptions;
  if (this.maxUsageLimit != null && this.maxRedemptions == null) this.maxRedemptions = this.maxUsageLimit;

  // Sync active flags
  if (this.active !== undefined && this.isActive === undefined) this.isActive = this.active;
  if (this.isActive !== undefined && this.active === undefined) this.active = this.isActive;

  next();
});

const redemptionSchema = new mongoose.Schema(
  {
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: String, required: true },
    discountAmount: { type: Number, required: true },
    currency: { type: String, required: true }, // "INR" | "USD"
  },
  { timestamps: true }
);

// One redemption per order to prevent double-counting across verify and webhooks
redemptionSchema.index({ couponId: 1, orderId: 1 }, { unique: true });

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
const CouponRedemption =
  mongoose.models.CouponRedemption || mongoose.model("CouponRedemption", redemptionSchema);

// ─── 2. Service ──────────────────────────────────────────────────────────────
const MIN_PAYABLE = { INR: 1, USD: 0.5 }; // Gateways reject zero or negative amounts
const round = (n, currency) => (currency === "INR" ? Math.round(n) : Math.round(n * 100) / 100);
const fail = (message) => ({ ok: false, message });

/**
 * Works out the discount for one order. Used by /coupon/validate AND by every
 * create-order route, so the amount charged is always calculated on the server.
 */
async function evaluateCoupon({ code, userId, planId, billingPeriod, currency, baseAmount }) {
  const clean = String(code || "").trim().toUpperCase();
  if (!clean) return fail("Enter a coupon code.");

  const coupon = await Coupon.findOne({
    code: clean,
    $or: [{ active: true }, { isActive: true }],
  });
  if (!coupon) return fail("This coupon code isn't valid.");

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) {
    return fail("This coupon isn't active yet.");
  }
  const validUntil = coupon.validTo || coupon.validUntil;
  if (validUntil && now > validUntil) {
    return fail("This coupon has expired.");
  }

  const eligiblePlans =
    coupon.plans && coupon.plans.length > 0
      ? coupon.plans
      : coupon.restrictedToPlans || [];
  if (eligiblePlans.length > 0 && !eligiblePlans.includes(planId)) {
    return fail("This coupon doesn't apply to this plan.");
  }

  if (coupon.billingPeriods && coupon.billingPeriods.length > 0 && !coupon.billingPeriods.includes(billingPeriod)) {
    return fail(`This coupon only works with ${coupon.billingPeriods.join(" or ")} billing.`);
  }

  const limit = coupon.maxRedemptions != null ? coupon.maxRedemptions : coupon.maxUsageLimit;
  const currentCount = coupon.redeemedCount != null ? coupon.redeemedCount : coupon.usedCount;
  if (limit != null && currentCount >= limit) {
    return fail("This coupon has been fully redeemed.");
  }

  const perUser = coupon.perUserLimit || 1;
  if (userId) {
    const used = await CouponRedemption.countDocuments({ couponId: coupon._id, userId });
    if (used >= perUser) {
      return fail(
        perUser === 1
          ? "You've already used this coupon."
          : `You've reached the usage limit (${perUser}x) for this coupon.`
      );
    }
  }

  let discount = 0;
  const couponType = coupon.type || coupon.discountType || "percent";

  if (couponType === "percent") {
    const pct = coupon.percent != null ? coupon.percent : coupon.discountValue || 0;
    discount = baseAmount * (pct / 100);

    // Apply cap if configured
    let cap = null;
    if (coupon.maxDiscount && coupon.maxDiscount[currency] != null) {
      cap = coupon.maxDiscount[currency];
    } else if (coupon.maxDiscountCap && coupon.maxDiscountCap > 0) {
      cap = coupon.maxDiscountCap;
    }
    if (cap && cap > 0) discount = Math.min(discount, cap);
  } else {
    // Flat discount
    let flatVal = 0;
    if (coupon.flat && coupon.flat[currency] != null && coupon.flat[currency] > 0) {
      flatVal = coupon.flat[currency];
    } else if (coupon.discountValue != null && coupon.discountValue > 0) {
      flatVal = coupon.discountValue;
    }
    discount = flatVal;
  }

  const minPay = MIN_PAYABLE[currency] || 1;
  discount = round(Math.min(discount, baseAmount - minPay), currency);
  if (discount <= 0) return fail("This coupon doesn't apply to this order.");

  const finalAmount = round(baseAmount - discount, currency);

  return {
    ok: true,
    coupon,
    baseAmount,
    discountAmount: discount,
    finalAmount,
  };
}

/** Call once per PAID order, from the payment-success path. Safe to call twice. */
async function recordRedemption({ couponId, userId, orderId, discountAmount, currency }) {
  if (!couponId || !orderId) return;
  try {
    await CouponRedemption.create({
      couponId,
      userId: userId || null,
      orderId,
      discountAmount: discountAmount || 0,
      currency: currency || "INR",
    });
  } catch (err) {
    if (err && err.code === 11000) {
      // Already recorded this order redemption, idempotently ignore
      return;
    }
    console.error("❌ Failed to record coupon redemption:", err);
  }

  // Increment redemption counters & update user audit
  try {
    const updateOps = {
      $inc: { redeemedCount: 1, usedCount: 1 },
    };
    if (userId) {
      updateOps.$push = {
        usedBy: {
          userId,
          usedAt: new Date(),
          timesUsed: 1,
        },
      };
    }
    await Coupon.updateOne({ _id: couponId }, updateOps);
    console.log(`✅ Recorded coupon redemption: Coupon ${couponId}, Order ${orderId}, User ${userId}`);
  } catch (updateErr) {
    console.error("❌ Failed to increment coupon counter:", updateErr);
  }
}

// ─── 3. Route: POST /payment/coupon/validate ─────────────────────────────────
const router = express.Router();

// Stops automated code brute-forcing: 20 tries per 10 minutes per IP
const couponLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Try again in a few minutes." },
});

router.post("/coupon/validate", authMiddleware, couponLimiter, async (req, res) => {
  try {
    const { code, planId, billingPeriod, currency } = req.body || {};

    if (!["INR", "USD"].includes(currency) || !["monthly", "yearly"].includes(billingPeriod)) {
      return res.status(400).json({ success: false, message: "Invalid plan parameters." });
    }

    const baseAmount = getPlanPrice(planId, billingPeriod, currency);
    if (!baseAmount) return res.status(400).json({ success: false, message: "Unknown plan." });

    const result = await evaluateCoupon({
      code,
      userId: req.user?._id,
      planId,
      billingPeriod,
      currency,
      baseAmount,
    });

    if (!result.ok) return res.status(400).json({ success: false, message: result.message });

    return res.json({
      success: true,
      coupon: {
        code: result.coupon.code,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount,
        planId,
        billingPeriod,
        currency,
      },
    });
  } catch (err) {
    console.error("Coupon validate error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Couldn't check the coupon. Try again." });
  }
});

module.exports = {
  Coupon,
  CouponRedemption,
  evaluateCoupon,
  recordRedemption,
  couponRouter: router,
};

