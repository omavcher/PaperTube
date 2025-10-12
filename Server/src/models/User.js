// models/User.js
const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  signature: { type: String },
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  amount: { type: Number, required: true },
  tokens: { type: Number, required: true },
  status: { type: String, enum: ['success', 'failed'], required: true },
  razorpay_payment_id: { type: String },
  razorpay_order_id: { type: String },
  razorpay_signature: { type: String },
  error: { type: String },
  paymentMethod: { type: String },
  userEmail: { type: String },
  userName: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const TokenUsageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  tokens: { type: Number, required: true },
});

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    picture: {
      type: String,
      default: "",
    },
    token: {
      type: Number,
      default: 100,
      min: 0,
    },
    usedToken: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactions: [TransactionSchema], // Payment transactions
    tokenUsageHistory: [TokenUsageSchema], // Tracks token usage per note/action
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    tokenTransactions: [
      {
        name: { type: String },
        type: { type: String }, // e.g. note_generation, quiz, etc.
        tokensUsed: { type: Number },
        date: { type: Date, default: Date.now },
        status: { type: String, default: "success" },
      },
    ],    
    notes: [
      {
        noteId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Note",
        },
      },
    ],
  },
  { timestamps: true }
);

// Prevent model overwrite issues in Next.js hot reload
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);