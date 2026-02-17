const mongoose = require("mongoose");

const ToolAnalyticsSchema = new mongoose.Schema({
  // Which tool was interacted with?
  toolId: { type: String, required: true }, 
  toolName: { type: String },
  category: { type: String },

  // Who did it? (Optional, if user is logged in)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // What kind of action? 
  // 'click' = clicked from dashboard
  // 'view' = landed directly on tool page
  eventType: { type: String, enum: ['click', 'view', 'search'], default: 'click' },

  // Where did they come from?
  source: { type: String, default: 'dashboard' }, // e.g., 'dashboard', 'direct', 'google'

  // Technical Metadata
  device: { type: String, default: 'desktop' }, // mobile/desktop
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ToolAnalytics || mongoose.model("ToolAnalytics", ToolAnalyticsSchema);