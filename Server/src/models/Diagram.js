const mongoose = require("mongoose");

const DiagramSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: true,
      enum: [
        "flowchart",
        "sequence",
        "class",
        "state",
        "er",
        "journey",
        "pie",
        "quadrant",
        "timeline",
        "sankey",
        "xy",
        "block"
      ],
    },
    model: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "English",
    },
    theme: {
      type: String,
      default: "cyber",
    },
    nodes: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        type: { type: String, required: true },
        details: { type: String },
        value: { type: Number }
      }
    ],
    edges: [
      {
        from: { type: String, required: true },
        to: { type: String, required: true },
        label: { type: String }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.models.Diagram || mongoose.model("Diagram", DiagramSchema);
