const mongoose = require("mongoose");

const SlideSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ""
  },
  layout: {
    type: String,
    enum: ["title", "bullets", "comparison", "metric"],
    required: true
  },
  bullets: [{
    type: String
  }],
  columns: {
    left: [{ type: String }],
    right: [{ type: String }]
  },
  metric: {
    value: { type: String, default: "" },
    label: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  speakerNotes: {
    type: String,
    default: ""
  }
});

const PresentationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null
    },
    title: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
      required: true
    },
    theme: {
      type: String,
      default: "orange-gradient"
    },
    slides: [SlideSchema],
    generationDetails: {
      model: {
        type: String,
        required: true,
        enum: ["flash", "canvas", "scholar", "atlas"]
      },
      language: {
        type: String,
        default: "English"
      },
      slideCount: {
        type: Number,
        required: true
      },
      prompt: {
        type: String,
        default: ""
      },
      cost: {
        type: Number,
        default: 0
      },
      processingTime: {
        type: Number,
        default: 0
      },
      generatedAt: {
        type: Date,
        default: Date.now
      }
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "completed"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Presentation || mongoose.model("Presentation", PresentationSchema);
