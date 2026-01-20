const mongoose = require("mongoose");

const GameStatsSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true // Faster lookups for "My High Scores"
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  game: { 
    type: String, 
    required: true 
  },
  stats: {
    score: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    accuracy: { type: Number }, // Optional: (correct_hits / total_clicks)
    timeSpent: { type: Number }, // In seconds
    timestamp: { type: Date, default: Date.now }
  },
  device: {
    isMobile: { type: Boolean },
    browser: { type: String }
  }
}, { timestamps: true });

// Index to find the Global High Scores quickly
GameStatsSchema.index({ "stats.score": -1 });

module.exports = mongoose.model("GameStats", GameStatsSchema);