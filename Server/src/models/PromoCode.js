// models/PromoCode.js
const mongoose = require("mongoose");

const PromoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  discountType: {
    type: String,
    enum: ["percent", "flat"],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  // Which plan types this code applies to.
  // 'all' means it works for everything, otherwise restrict.
  applicableTo: {
    type: String,
    enum: ["all", "subscription", "token"],
    default: "all"
  },
  // Optionally restrict to specific plan IDs (e.g. ["pro", "power"])
  // An empty array means unrestricted within the applicableTo type.
  restrictedToPlans: {
    type: [String],
    default: []
  },
  // Minimum order amount (after offer discounts, before GST)
  minOrderAmount: {
    type: Number,
    default: 0
  },
  // Max discount cap for percent codes (0 = no cap)
  maxDiscountCap: {
    type: Number,
    default: 0
  },
  maxUsageLimit: {
    type: Number,
    required: true,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  // Per-user usage limit (1 = one-time use per user)
  perUserLimit: {
    type: Number,
    default: 1
  },
  // Track which users have used this code
  usedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      usedAt: { type: Date, default: Date.now },
      timesUsed: { type: Number, default: 1 }
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  // Optional validity window
  validFrom: {
    type: Date,
    default: null
  },
  validUntil: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
PromoCodeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual: slots remaining
PromoCodeSchema.virtual("slotsRemaining").get(function () {
  return Math.max(0, this.maxUsageLimit - this.usedCount);
});

// Virtual: is expired
PromoCodeSchema.virtual("isExpired").get(function () {
  const now = new Date();
  if (this.validUntil && now > this.validUntil) return true;
  if (this.validFrom && now < this.validFrom) return true;
  return false;
});

PromoCodeSchema.set("toJSON", { virtuals: true });
PromoCodeSchema.set("toObject", { virtuals: true });

module.exports =
  mongoose.models.PromoCode || mongoose.model("PromoCode", PromoCodeSchema);
