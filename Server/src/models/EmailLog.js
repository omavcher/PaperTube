// models/EmailLog.js
const mongoose = require("mongoose");

const EmailLogSchema = new mongoose.Schema(
  {
    // Who received / triggered
    to: { type: String, required: true },
    toName: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // What was sent
    subject: { type: String, required: true },
    templateType: {
      type: String,
      enum: [
        "welcome",
        "subscription_purchase",
        "token_purchase",
        "subscription_expiring",
        "subscription_expired",
        "subscription_renewed",
        "low_tokens",
        "invoice",
        "marketing",
        "custom",
        "admin_alert",
      ],
      default: "custom",
    },
    templateData: { type: mongoose.Schema.Types.Mixed, default: {} }, // optional snapshot

    // Delivery info
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
    },
    provider: { type: String, default: "" }, // which SMTP account was used
    error: { type: String, default: null },
    attemptCount: { type: Number, default: 1 },
    messageId: { type: String, default: null },
  },
  { timestamps: true }
);

// Index for fast admin queries
EmailLogSchema.index({ status: 1 });
EmailLogSchema.index({ templateType: 1 });
EmailLogSchema.index({ createdAt: -1 });
EmailLogSchema.index({ userId: 1 });

module.exports =
  mongoose.models.EmailLog || mongoose.model("EmailLog", EmailLogSchema);
