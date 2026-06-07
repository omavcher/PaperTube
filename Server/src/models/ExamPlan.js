const mongoose = require("mongoose");

const examPlanSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    examName: { type: String, required: true },
    targetDate: { type: Date, required: true },
    dailyHours: { type: String, required: true },
    prepLevel: { type: String, required: true },
    content: { type: String, required: true }, // Store the JSON string plan
    model: { type: String, default: "flash" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ExamPlan || mongoose.model("ExamPlan", examPlanSchema);
