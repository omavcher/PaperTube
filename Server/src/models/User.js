const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  signature: { type: String },
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  packageType: { type: String, enum: ['subscription', 'token'], default: 'token' },
  billingPeriod: { type: String, enum: ['monthly', 'yearly'], default: undefined },
  amount: { type: Number, required: true },
  baseAmount: { type: Number },
  discountAmount: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  tokens: { type: Number, default: null },
  status: { type: String, enum: ['success', 'failed'], required: true },
  couponCode: { type: String },
  packageMeta: { type: mongoose.Schema.Types.Mixed, default: {} },
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
  tokens: { type: Number, required: true , default: 0},
});

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    googleAccessToken: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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
    followerUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    // Tactical Stats
  xp: { type: Number, default: 0 },
  rank: { type: String, default: "NOVICE_NODE" },
  totalGamesPlayed: { type: Number, default: 0 },
  
    followingUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    mobile: {
      type: String,
      required: false,
      trim: true,
    },
    picture: {
      type: String,
      default: "",
    },
    isNewUser: {
      type: Boolean,
      default: true
    },
    tokens: {
      type: Number,
      default: 3,
    },
    tokenUsageHistory: [TokenUsageSchema],
    lastTokenReset: {
      type: Date,
      default: Date.now
    },
    transactions: [TransactionSchema],
    joinedAt: {
      type: Date,
      default: Date.now,
    },   
    notes: [
      {
        noteId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Note",
        },
      },
    ],
    noteCreationHistory: [{
      noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
      model: String,
      createdAt: { type: Date, default: Date.now },
      videoTitle: String
    }],
    membership: {
      isActive: { type: Boolean, default: false },
      planId: { type: String },
      planName: { type: String },
      billingPeriod: { type: String, enum: ['monthly', 'yearly'], default: undefined },
      startedAt: { type: Date },
      expiresAt: { type: Date },
      lastPaymentId: { type: String },
      autoRenew: { type: Boolean, default: false },
    },

    
    flashcardSets: [{
    setId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlashcardSet' },
    addedAt: { type: Date, default: Date.now }
  }],
  
  flashcardCreationHistory: [{
    setId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlashcardSet' },
    model: String,
    createdAt: { type: Date, default: Date.now },
    videoTitle: String,
    cardCount: Number
  }],
  
  flashcardStats: {
    totalCardsStudied: { type: Number, default: 0 },
    totalStudyTime: { type: Number, default: 0 }, // minutes
    streak: { type: Number, default: 0 },
    lastStudyDate: { type: Date },
    masteryRate: { type: Number, default: 0 } // percentage
  }
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);