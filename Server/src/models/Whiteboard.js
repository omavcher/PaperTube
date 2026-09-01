const mongoose = require("mongoose");

const WhiteboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for guest boards
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Whiteboard",
      trim: true,
    },
    elements: {
      type: Array,
      default: [],
    },
    appState: {
      type: Object,
      default: {},
    },
    files: {
      type: Object,
      default: {},
    },
    thumbnail: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    elementCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Whiteboard || mongoose.model("Whiteboard", WhiteboardSchema);
