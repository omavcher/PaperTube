const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrl: { type: String },
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
    likes: { type: Number, default: 0 },
    userLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isAiResponse: { type: Boolean, default: false },
    replies: [{
      content: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      likes: { type: Number, default: 0 },
      userLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      isAiResponse: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }]
  }, { timestamps: true });

module.exports = mongoose.model("Comment", CommentSchema);