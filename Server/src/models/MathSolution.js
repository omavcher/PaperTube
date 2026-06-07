const mongoose = require("mongoose");

const mathSolutionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    question: { type: String, default: "" },
    image: { type: String, default: "" }, // Base64 data URL string representation of the uploaded question image
    content: { type: String, required: true },
    model: { type: String, default: "flash" },
    language: { type: String, default: "English" },
    tone: { type: String, default: "Step-by-step" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.MathSolution || mongoose.model("MathSolution", mathSolutionSchema);
