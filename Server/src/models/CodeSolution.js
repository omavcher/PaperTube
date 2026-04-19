const mongoose = require('mongoose');

const codeSolutionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, required: true, unique: true },
    problemUrl: { type: String, required: true },
    title: { type: String, required: true },
    difficulty: { type: String, default: 'Unknown' },
    platform: { type: String, default: 'LeetCode' },
    
    // Extracted problem data
    problemDescription: { type: String },

    // Generated AI data (new structured format)
    solutionContent: { type: String, required: true }, // Core insight / aha moment
    solutionSteps: { type: Array, default: [] },        // [{n, title, body}]
    keyPoints: { type: Array, default: [] },            // [{label, value}]
    codeSnippet: { type: String },                      // Raw implementation code
    codeLanguage: { type: String, default: 'C++' },     // Language used
    timeComplexity: { type: String },
    spaceComplexity: { type: String },

    // Meta
    modelUsed: { type: String },
    tokensUsed: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CodeSolution', codeSolutionSchema);

