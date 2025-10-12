const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId, // use ObjectId for user reference
      ref: "User", // ✅ must be a string, not variable
      required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    thumbnail: { type: String, default: "" },
    videoUrl: { type: String, required: true },
    videoId: { type: String, required: true },
    transcript: { type: String, required: true },
    img_with_url: [
      {
        title: { type: String, required: true },
        img_url: { type: String, default: null },
      },
    ],
    content: { type: String, required: true }, // PDF/text content
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

module.exports = mongoose.models.Note || mongoose.model("Note", noteSchema);
