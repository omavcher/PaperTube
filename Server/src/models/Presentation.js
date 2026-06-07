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
    enum: [
      "title", "section_break", "conclusion",
      "bullets", "paragraph", "quote", "two_column_text",
      "comparison", "pros_cons", "metric_callout", "matrix_2x2",
      "timeline", "steps", "roadmap",
      "image_left", "image_right", "gallery_grid",
      "metric"
    ],
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
  },
  variantIndex: {
    type: Number,
    default: 0
  },
  bgImageIndex: {
    type: Number,
    default: 0
  },
  author: {
    type: String,
    default: ""
  },
  content: {
    type: String,
    default: ""
  },
  quote_text: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: ""
  },
  left_text: {
    type: String,
    default: ""
  },
  right_text: {
    type: String,
    default: ""
  },
  pros: [{
    type: String
  }],
  cons: [{
    type: String
  }],
  metrics: [{
    value: { type: String, default: "" },
    label: { type: String, default: "" }
  }],
  quadrants: [{
    type: String
  }],
  events: [{
    year: { type: String, default: "" },
    description: { type: String, default: "" }
  }],
  steps: [{
    type: String
  }],
  phases: [{
    phase: { type: String, default: "" },
    goal: { type: String, default: "" }
  }],
  image_url: { type: String, default: "" },
  alt_text: { type: String, default: "" },
  images: [{
    type: String
  }]
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
