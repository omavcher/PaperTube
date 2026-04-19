const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['MCQ', 'MSQ', 'NAT', 'FITB'],
    required: true
  },
  question: { type: String, required: true },
  options: { type: [String], default: [] },
  correctAnswer: { type: mongoose.Schema.Types.Mixed }, // String for MCQ/FITB/NAT
  correctAnswers: { type: [String], default: [] }, // Array for MSQ
  explanation: { type: String, default: '' },
  tolerance: { type: Number, default: 0 } // For NAT
});

const practiceTestSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  videoUrl: { type: String, required: true },
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  transcript: { type: String },
  questions: [questionSchema],
  status: { type: String, default: 'completed' },
  visibility: { type: String, enum: ['public', 'private'], default: 'private' },
  generationDetails: {
    language: String,
    testType: String,
    cost: Number,
    generatedAt: Date,
    processingTime: Number,
    tier: String,
    questionCount: Number,
    metadata: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model('PracticeTest', practiceTestSchema);
