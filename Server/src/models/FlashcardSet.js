// models/FlashcardSet.js
const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['basic', 'visual', 'detailed', 'mnemonic', 'quiz', 'multiple_choice', 'true_false', 'fill_blank', 'matching', 'memory_enhanced'],
    default: 'basic'
  },
  front: { type: String, required: true },
  back: { type: String, required: true },
  image: { type: String },
  mnemonic: { type: String },
  explanation: { type: String },
  options: [{ type: String }], // For multiple choice
  category: { type: String, default: 'General' },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  importance: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [{ type: String }],
  memoryHooks: [{ type: String }],
  visualCue: { type: String },
  association: { type: String },
  story: { type: String },
  memoryPalaceLocation: { type: String },
  sensoryDetails: {
    sight: String,
    sound: String,
    smell: String,
    touch: String
  },
  
  // SRS fields for premium
  srsParams: {
    interval: { type: Number, default: 24 }, // hours
    easeFactor: { type: Number, default: 2.5 },
    repetitions: { type: Number, default: 0 }
  },
  difficultyLevel: { type: Number, min: 1, max: 5 }, // 1-5 scale
  learningObjectives: [{ type: String }],
  commonMistakes: [{ type: String }],
  
  // Study tracking
  mastery: { 
    type: String, 
    enum: ['new', 'learning', 'mastered', 'reviewing'],
    default: 'new'
  },
  reviewCount: { type: Number, default: 0 },
  lastReviewed: { type: Date },
  nextReview: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const flashcardSetSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  videoUrl: { type: String, required: true },
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  thumbnail: { type: String }, // YouTube video thumbnail URL
  transcript: { type: String },
  flashcards: [flashcardSchema],
  
  // Generation details
  generationDetails: {
    language: { type: String, default: 'English' },
    cardType: { type: String, default: 'basic' },
    prompt: { type: String },
    cost: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now },
    processingTime: { type: Number }, // in seconds
    type: { 
      type: String, 
      enum: ['free', 'premium'],
      default: 'free'
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
    featuresUsed: [{ type: String }],
    cardCount: { type: Number }
  },
  
  // Set status
  status: { 
    type: String, 
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  error: { type: String },
  
  // Visibility
  visibility: { 
    type: String, 
    enum: ['private', 'public', 'shared'],
    default: 'private'
  },
  
  // Statistics
  stats: {
    totalReviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    lastStudied: { type: Date },
    totalStudyTime: { type: Number, default: 0 } // in minutes
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamps
flashcardSetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
flashcardSetSchema.index({ owner: 1, createdAt: -1 });
flashcardSetSchema.index({ slug: 1 });
flashcardSetSchema.index({ videoId: 1 });
flashcardSetSchema.index({ 'generationDetails.type': 1 });
flashcardSetSchema.index({ 'flashcards.nextReview': 1 });

module.exports = mongoose.model('FlashcardSet', flashcardSetSchema);