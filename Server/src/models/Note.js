const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    
    // --- Visibility Feature ---
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
      required: true,
    },
    
    // --- Content Source Details ---
    thumbnail: { type: String, default: "" },
    videoUrl: { type: String, required: true },
    videoId: { type: String, required: true },
    
    // --- Generated Content Details ---
    transcript: { type: String, required: true },
    img_with_url: [
      {
        title: { type: String, required: true },
        img_url: { type: String, default: null },
      },
    ],
    content: { type: String, required: true },
    
    // --- Generation Details (For both Free & Premium) ---
    generationDetails: {
      // Core generation info
      model: { 
        type: String, 
        required: true,
        enum: ['sankshipta', 'bhashasetu', 'parikshasarthi', 'vyavastha', 'sarlakruti']
      },
      type: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free',
        required: true
      },
      
      // Settings used
      language: {
        type: String,
        default: 'English',
        enum: ["English", "Hindi", "Marathi", "Bengali", "Telugu", "Tamil", "Kannada"]
      },
      detailLevel: {
        type: String,
        default: 'Standard Notes',
        enum: ['Brief Summary', 'Standard Notes', 'Comprehensive', 'Bullet Points Only']
      },
      prompt: { type: String, default: "" },
      
      // Cost & processing info
      cost: { type: Number, default: 0 }, // Token cost for free, 0 for premium
      processingTime: { type: Number, default: 0 }, // in seconds
      generatedAt: { type: Date, default: Date.now },
    },
    
    // --- Final PDF Details ---
    pdf_data: {
      fileId: { type: String, default: null },
      fileName: { type: String, default: null },
      viewLink: { type: String, default: null },
      downloadLink: { type: String, default: null },
      thumbnailLink: { type: String, default: null },
      fileSize: { type: Number, default: null },
      uploadedAt: { type: Date, default: Date.now }
    },
    
    
    // --- Analytics & Engagement ---
    views: { type: Number, default: 0 },
    viewHistory: [{
      date: { type: Date, default: Date.now },
      count: { type: Number, default: 1 }
    }],
    lastViewedAt: { type: Date },
    likes: { type: Number, default: 0 },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    
    // --- Status Tracking ---
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing"
    },
    error: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Note || mongoose.model("Note", noteSchema);