const mongoose = require('mongoose');

const JourneyStepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }
});

const SuccessStorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  handle: { type: String, required: true },
  avatar: { type: String, required: true },
  exam: { type: String, required: true },
  rank: { type: String, required: true },
  heroTitle: { type: String, required: true },
  summary: { type: String, required: true },
  fullJourney: [JourneyStepSchema],
  date: { type: String, required: true },
  
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },

  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SuccessStory', SuccessStorySchema);