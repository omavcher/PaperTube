// models/Quiz.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    minlength: 5
  },
  options: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        // For true/false, must have exactly ["True", "False"]
        if (this.quizType === 'truefalse') {
          return v.length === 2 && v.includes('True') && v.includes('False');
        }
        // For fill, should be empty
        if (this.quizType === 'fill') {
          return v.length === 0;
        }
        // For others, should have at least 2 options
        return v.length >= 2;
      },
      message: props => `Invalid options for ${props.quizType} quiz type`
    }
  },
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  explanation: {
    type: String,
    default: '',
    trim: true
  },
  questionNumber: {
    type: Number,
    required: true,
    min: 1
  },
  quizType: {
    type: String,
    enum: ['mcq', 'multi', 'truefalse', 'fill'],
    default: 'mcq',
    required: true
  }
});

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  videoUrl: {
    type: String,
    required: true,
    trim: true
  },
  videoId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  settings: {
    language: {
      type: String,
      default: 'English'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    quizType: {
      type: String,
      enum: ['mcq', 'multi', 'truefalse', 'fill'],
      default: 'mcq'
    },
    count: {
      type: Number,
      default: 5,
      min: 1,
      max: 30
    },
    detailLevel: {
      type: String,
      enum: ['Brief', 'Standard', 'Detailed', 'Comprehensive'],
      default: 'Standard'
    },
    includeExplanation: {
      type: Boolean,
      default: true
    }
  },
  questions: [questionSchema],
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  transcriptSource: {
    type: String,
    enum: ['transcript', 'none'],
    default: 'none'
  },
  prompt: String,
  model: String,
  metadata: {
    videoDuration: String,
    channelName: String,
    hasTranscript: Boolean,
    transcriptLength: Number,
    generationTime: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
quizSchema.index({ userId: 1, createdAt: -1 });
quizSchema.index({ videoId: 1, userId: 1 });
quizSchema.index({ userEmail: 1, createdAt: -1 });
quizSchema.index({ 'settings.quizType': 1, createdAt: -1 });

// Pre-save middleware to set quizType on each question
quizSchema.pre('save', function(next) {
  this.questions.forEach(question => {
    question.quizType = this.settings.quizType;
  });
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);