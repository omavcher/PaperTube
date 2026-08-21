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
    type: mongoose.Schema.Types.Mixed
  }],
  columns: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({ left: [], right: [] })
  },
  metric: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({ value: "", label: "", description: "" })
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
    type: mongoose.Schema.Types.Mixed
  }],
  cons: [{
    type: mongoose.Schema.Types.Mixed
  }],
  metrics: [{
    type: mongoose.Schema.Types.Mixed
  }],
  quadrants: [{
    type: mongoose.Schema.Types.Mixed
  }],
  events: [{
    type: mongoose.Schema.Types.Mixed
  }],
  steps: [{
    type: mongoose.Schema.Types.Mixed
  }],
  phases: [{
    type: mongoose.Schema.Types.Mixed
  }],
  image_url: { type: String, default: "" },
  alt_text: { type: String, default: "" },
  images: [{
    type: String
  }]
}, { strict: false });

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
