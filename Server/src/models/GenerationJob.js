const mongoose = require('mongoose');

const generationJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    videoId: {
      type: String,
      required: true
    },
    videoUrl: {
      type: String,
      required: true
    },
    videoTitle: {
      type: String,
      default: 'YouTube Lecture'
    },
    duration: {
      type: Number,
      default: 0
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'scholar', 'power'],
      default: 'free'
    },
    model: {
      type: String,
      default: 'flash'
    },
    status: {
      type: String,
      enum: [
        'QUEUED',
        'INITIALIZING',
        'PROCESSING_TRANSCRIPT',
        'DETECTING_CHAPTERS',
        'EXTRACTING_KNOWLEDGE',
        'BUILDING_KNOWLEDGE',
        'PLANNING_NOTES',
        'GENERATING_NOTES',
        'GENERATING_VISUALS',
        'QUALITY_CHECK',
        'RENDERING',
        'COMPLETED',
        'FAILED',
        'CANCELLED'
      ],
      default: 'QUEUED',
      index: true
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    currentStage: {
      type: String,
      default: 'Initializing job...'
    },
    currentMessage: {
      type: String,
      default: 'Connecting to lecture source...'
    },
    tokenUsage: {
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 }
    },
    estimatedCost: {
      type: Number,
      default: 0
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      default: null
    },
    slug: {
      type: String,
      default: null
    },
    error: {
      type: String,
      default: null
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.GenerationJob || mongoose.model('GenerationJob', generationJobSchema);
