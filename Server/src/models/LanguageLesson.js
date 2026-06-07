const mongoose = require("mongoose");

const languageLessonSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    targetLanguage: { type: String, required: true },
    proficiencyLevel: { type: String, required: true },
    learningFocus: { type: String, required: true },
    topic: { type: String, required: true },
    content: { type: String, required: true }, // Store the JSON string language lesson data
    model: { type: String, default: "flash" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.LanguageLesson || mongoose.model("LanguageLesson", languageLessonSchema);
