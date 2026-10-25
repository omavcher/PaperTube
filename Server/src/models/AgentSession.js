const mongoose = require("mongoose");

const AgentSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: "Autonomous Agent Session",
    },
    model: {
      type: String,
      default: "paper-fast",
    },
    capability: {
      type: String,
      default: "auto",
    },
    messages: {
      type: Array,
      default: [],
    },
    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

AgentSessionSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.models.AgentSession || mongoose.model("AgentSession", AgentSessionSchema);
