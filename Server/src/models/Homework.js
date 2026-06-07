const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    question: { type: String, required: true },
    additionalPrompt: { type: String },
    content: { type: String, required: true },
    model: { type: String, default: "flash" },
    language: { type: String, default: "English" },
    tone: { type: String, default: "Step-by-step" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Homework || mongoose.model("Homework", homeworkSchema);
