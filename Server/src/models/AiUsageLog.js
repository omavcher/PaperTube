// models/AiUsageLog.js
const mongoose = require("mongoose");

const AiUsageLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    feature: {
      type: String,
      required: true,
      index: true,
      enum: [
        "notes_engine",
        "notes_free",
        "notes_premium",
        "agent",
        "agent_image",
        "image_gen",
        "chat",
        "presentation",
        "study_homework",
        "study_math",
        "study_planner",
        "study_tutor",
        "test_quiz",
        "flashcards",
        "writer_humanize",
        "writer_essay",
        "writer_detect",
        "whiteboard",
        "code_solver",
        "diagram",
        "other",
      ],
    },
    model: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    costUSD: {
      type: Number,
      default: 0,
    },
    capacityUnits: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["success", "failed", "quota_blocked"],
      default: "success",
    },
    errorMessage: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Compound indexes for rapid aggregation and analytics
AiUsageLogSchema.index({ userId: 1, createdAt: -1 });
AiUsageLogSchema.index({ feature: 1, createdAt: -1 });
AiUsageLogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.AiUsageLog || mongoose.model("AiUsageLog", AiUsageLogSchema);
