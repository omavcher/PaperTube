const mongoose = require("mongoose");

const essaySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    topic: { type: String, required: true },
    academicLevel: { type: String, default: "College Level" },
    essayType: { type: String, default: "Research Paper" },
    citationStyle: { type: String, default: "APA" },
    wordCount: { type: Number, default: 1500 },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Essay || mongoose.model("Essay", essaySchema);
