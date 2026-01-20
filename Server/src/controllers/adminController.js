const Note = require("../models/Note");
const User = require("../models/User");
const FlashcardSet = require("../models/FlashcardSet");
const Quiz = require("../models/Quiz");
const Transaction = require("../models/Transaction");
const Analytics = require("../models/Analytics");
const Bug = require("../models/Bug");
const mongoose = require("mongoose");

exports.getDiagnostics = async (req, res) => {
  try {
    // 1. Basic Counts
    const totalUsers = await User.countDocuments();
    const totalNotes = await Note.countDocuments();
    const totalFlashcardSets = await FlashcardSet.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();

    // 2. Revenue Calculation
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);

    // 3. Source Distribution
    const sourceDistribution = await Analytics.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);

    // 4. Fetch Last 5 Created Items (Populated with User Details)

    // --- NOTES ---
    const recentNotes = await Note.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'owner',
        select: 'name email' // Only get name and email
      })
      .lean()
      .select('title createdAt thumbnail owner');

    // --- FLASHCARDS ---
    const recentFlashcardSets = await FlashcardSet.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'owner',
        select: 'name email'
      })
      .lean()
      .select('title createdAt thumbnail owner');

    // --- QUIZZES ---
    // Note: Quiz model uses 'userId', not 'owner'. We fetch it and map it to 'owner' for consistency.
    const recentQuizzesRaw = await Quiz.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'userId',
        select: 'name email'
      })
      .lean()
      .select('title createdAt thumbnail userId');

    // Standardize Quiz structure (rename userId -> owner)
    const recentQuizzes = recentQuizzesRaw.map(quiz => ({
      ...quiz,
      owner: quiz.userId, // Map the populated user object to 'owner'
      userId: undefined   // Remove the old key to avoid confusion
    }));

    // 5. Construct Response
    const last5Creations = {
      notes: recentNotes,
      flashcardSets: recentFlashcardSets,
      quizzes: recentQuizzes
    };

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalNotes,
        totalFlashcardSets,
        totalQuizzes,
        totalRevenue: totalRevenue[0] ? totalRevenue[0].totalAmount : 0,
        sourceDistribution,
        last5Creations
      }
    });

  } catch (error) {
    console.error("❌ Diagnostics Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching diagnostics.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email membership joinedAt picture').lean();
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("❌ Get All Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }
    await User.deleteOne({ _id: userId });
    res.status(200).json({
      success: true,
      message: "User deleted successfully."
    });
  } catch (error) { 
    console.error("❌ Delete User Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    // 1. Find all transactions
    // 2. .populate('userId') fetches data from the User collection
    // 3. We specify the fields we want: 'name email picture mobile'
    const transactions = await Transaction.find()
      .populate({
        path: 'userId',
        select: 'name email picture mobile' // These are the fields from UserSchema
      })
      .sort({ timestamp: -1 }) // Usually better to see newest first
      .lean();

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message
    });
  }
};

exports.getRecentCreations = async (req, res) => {
  try {
    const recentNotes = await Note.find().sort({ createdAt: -1 }).lean().select('title createdAt thumbnail visibility generationDetails views likes owner');
    const recentFlashcardSets = await FlashcardSet.find().sort({ createdAt: -1 }).lean().select('title createdAt thumbnail owner visibility generationDetails');
    const recentQuizzes = await Quiz.find().sort({ createdAt: -1 }).lean().select('title createdAt thumbnail owner settings');

    const notes = await Promise.all(recentNotes.map(async (note) => {
      const user = await User.findById(note.owner).select('name email picture').lean();
      return { note, user };
    }));

    const flashcardSets = await Promise.all(recentFlashcardSets.map(async (set) => {
      const user = await User.findById(set.owner).select('name email picture').lean();
      return { set, user };
    }));

    const quizzes = await Promise.all(recentQuizzes.map(async (quiz) => {
      const user = await User.findById(quiz.owner).select('name email picture').lean();
      return { quiz, user };
    }));

res.status(200).json({
      success: true,
      data: { notes, flashcardSets, quizzes }
    });

  } catch (error) { 
    console.error("❌ Get Recent Creations Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching recent creations.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.getAllBugs = async (req, res) => {
  try {
    const bugs = await Bug.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: bugs
    });
  } catch (error) {
    console.error("❌ Get All Bugs Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bugs.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




