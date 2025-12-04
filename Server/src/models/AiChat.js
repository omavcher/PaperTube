const mongoose = require("mongoose");

const aiChatSchema = new mongoose.Schema(
  {
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        feedback: { type: String, enum: ["good", "bad", null], default: null },
        videoLink: { type: String, default: null },
      },
    ],
},
  { timestamps: true } // automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("AiChat", aiChatSchema);