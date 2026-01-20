// models/Analytics.js
const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
  userId: { type: String, default: null }, // ID from your localStorage user object
  email: { type: String, default: null },
  isLoggedIn: { type: Boolean, default: false },
  source: { type: String, default: "Direct" }, // Instagram, WhatsApp, etc.
  path: { type: String }, // e.g., /home, /products
  userAgent: { type: String }, // Browser/Device info
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Analytics", AnalyticsSchema);