const mongoose = require("mongoose");

const BugSchema = new mongoose.Schema({
  title: { type: String, required: true, uppercase: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'critical'], default: 'low' },
  evidenceUrl: { type: String }, // The Cloudinary URL
  status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
  userId: { type: String, default: 'guest', index: true },
  metadata: {
    userAgent: String,
    resolution: String,
    ip: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Bug", BugSchema);