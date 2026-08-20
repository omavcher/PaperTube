const mongoose = require("mongoose");

const aiCertificateSchema = new mongoose.Schema(
  {
    certId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    aiProbability: {
      type: Number,
      required: true
    },
    humanProbability: {
      type: Number,
      required: true
    },
    confidence: {
      type: Number,
      default: 94
    },
    verdictTitle: {
      type: String,
      default: "AI Analysis Complete"
    },
    verdictDesc: {
      type: String,
      default: ""
    },
    features: {
      wordCount: { type: Number, default: 0 },
      sentenceCount: { type: Number, default: 0 },
      avgSentenceLength: { type: Number, default: 0 },
      burstiness: { type: Number, default: 0 },
      diversity: { type: Number, default: 0 },
      readability: { type: Number, default: 0 }
    },
    llmFeedback: {
      perplexity: { type: Number, default: 0 },
      structure: { type: String, default: "" },
      patterns: [{ type: String }],
      transitions: [{ type: String }]
    },
    multiModelScores: {
      gpt4o: { type: Number, default: 0 },
      claude35: { type: Number, default: 0 },
      gemini20: { type: Number, default: 0 },
      llama3: { type: Number, default: 0 }
    },
    textSnippet: {
      type: String,
      default: ""
    },
    issuedBy: {
      type: String,
      default: "Paperxify Academic Integrity Office (paperxify.com)"
    },
    issueDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AICertificate", aiCertificateSchema);
