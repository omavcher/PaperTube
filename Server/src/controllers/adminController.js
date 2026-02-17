const Note = require("../models/Note");
const User = require("../models/User");
const FlashcardSet = require("../models/FlashcardSet");
const Quiz = require("../models/Quiz");
const Transaction = require("../models/Transaction");
const Analytics = require("../models/Analytics");
const Bug = require("../models/Bug");
const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const GameStats = require("../models/GameStats");
const SuccessStory = require('../models/SuccessStory');
const BlogPost = require('../models/BlogPost');

exports.getDiagnostics = async (req, res) => {
  try {
    // 1. Basic Counts
    const totalUsers = await User.countDocuments();
    const totalNotes = await Note.countDocuments();

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


    // 5. Construct Response
    const last5Creations = {
      notes: recentNotes,
    };

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalNotes,
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
    // Fetch all transactions
    const transactions = await Transaction.find({});
    // Return success response
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });

  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
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

    const notes = await Promise.all(recentNotes.map(async (note) => {
      const user = await User.findById(note.owner).select('name email picture').lean();
      return { note, user };
    }));


res.status(200).json({
      success: true,
      data: { notes }
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


exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error("❌ Get All Feedback Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching feedback.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found."
      });
    }
    await Feedback.deleteOne({ _id: feedbackId });
    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully."
    });
  }
  catch (error) { 
    console.error("❌ Delete Feedback Error:", error);
    res.status(500).json({  
      success: false,
      message: "Server error while deleting feedback.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.respondToFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const { response } = req.body;
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found."
      });
    }
    feedback.adminResponse = response;
    feedback.respondedAt = new Date();
    await feedback.save();
    res.status(200).json({
      success: true,
      message: "Responded to feedback successfully."
    });
  }
  catch (error) {
    console.error("❌ Respond to Feedback Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while responding to feedback.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



exports.getAnalytics = async (req, res) => {
  try {
    const logs = await Analytics.find().sort({ timestamp: -1 }).lean();
    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error("❌ Get Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.getArcadeDiagnostics = async (req, res) => {
  try {
    // 1. Total Players
    const totalPlayers = await GameStats.distinct("userId").then(users => users.length);
    // 2. Global High Scores (Top 10)
    const arcadeScores = await GameStats.find()
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: {
        totalPlayers,
       arcadeScores
      }
    });
  } catch (error) {
    console.error("❌ Get Arcade Diagnostics Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching arcade diagnostics.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Get ALL stories for admin (including unapproved)
exports.adminGetAllStories = async (req, res) => {
  try {
    const stories = await SuccessStory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Buffer access failed." });
  }
};

// Approve a story
exports.approveStory = async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndUpdate(
      req.params.id, 
      { isApproved: true }, 
      { new: true }
    );
    res.status(200).json({ success: true, message: "Protocol approved." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Approval failed." });
  }
};

// Delete a story
exports.deleteStory = async (req, res) => {
  try {
    await SuccessStory.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Data purged." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Purge sequence failed." });
  }
};

exports.updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedStory = await SuccessStory.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedStory) {
      return res.status(404).json({
        success: false,
        message: "Target node not found in database."
      });
    }

    res.status(200).json({
      success: true,
      message: "Neural data updated successfully.",
      data: updatedStory
    });

  } catch (error) {
    console.error("Update Error:", error);
    
    // Handle specific MongoDB ID errors
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: "Invalid Story ID format."
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error: Update sequence failed."
    });
  }
};




// --- ADMIN CONTROLLERS ---

// @route POST /api/admin/blog/create
exports.createPost = async (req, res) => {
  try {
    const { slug } = req.body;
    
    // Check for duplicate slug
    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: "Slug already exists." });
    }

    const newPost = new BlogPost(req.body);
    await newPost.save();

    res.status(201).json({
      success: true,
      message: "Blog post deployed to database.",
      data: newPost
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Creation protocol failed." });
  }
};

// @route GET /api/admin/blog/all
exports.getAllAdminPosts = async (req, res) => {
  try {
    // Admin needs all data, sorted by newest
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch failed." });
  }
};

// @route PATCH /api/admin/blog/update/:id
exports.updatePost = async (req, res) => {
  try {
    const updatedPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    res.status(200).json({ success: true, message: "Post updated.", data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed." });
  }
};

// @route DELETE /api/admin/blog/delete/:id
exports.deletePost = async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Post terminated." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed." });
  }
};


exports.getContentAnalytics = async (req, res) => {
  try {
    const { range } = req.query;

    // 1. Date Filtering Logic
    let dateFilter = {};
    if (range && range !== 'all') {
      const now = new Date();
      if (range === '24h') now.setHours(now.getHours() - 24);
      if (range === '7d') now.setDate(now.getDate() - 7);
      if (range === '30d') now.setDate(now.getDate() - 30);
      if (range === '90d') now.setDate(now.getDate() - 90);
      
      dateFilter = { createdAt: { $gte: now } };
    }

    // 2. Fetch Data (Parallel for Performance)
    const [blogs, stories] = await Promise.all([
      BlogPost.find(dateFilter).select('title meta slug createdAt'),
      SuccessStory.find(dateFilter).select('name rank views shares conversions slug createdAt')
    ]);

    // 3. Aggregate Overview Stats
    let totalViews = 0;
    let totalShares = 0;
    let totalConversions = 0;
    let totalReadTime = 0;
    let blogCount = 0;

    // Process Blogs
    const processedBlogs = blogs.map(b => {
      const views = b.meta?.views || 0;
      const shares = b.meta?.shares || 0;
      const conversions = b.meta?.conversions || 0;
      const readTimeVal = parseInt(b.meta?.readTime) || 5; // Default 5 min if parsing fails

      totalViews += views;
      totalShares += shares;
      totalConversions += conversions;
      totalReadTime += readTimeVal;
      blogCount++;

      // Calculate individual conversion for the list
      const convRate = views > 0 ? ((shares / views) * 100).toFixed(1) : "0.0";

      return {
        _id: b._id,
        title: b.title,
        views,
        shares,
        conversion: `${convRate}%`
      };
    });

    // Process Stories
    const processedStories = stories.map(s => {
      const views = s.views || 0;
      const shares = s.shares || 0;
      const conversions = s.conversions || 0;

      totalViews += views;
      totalShares += shares;
      totalConversions += conversions;

      // Calculate individual conversion
      const convRate = views > 0 ? ((shares / views) * 100).toFixed(1) : "0.0";

      return {
        _id: s._id,
        name: s.name,
        rank: s.rank || "N/A",
        views,
        shares,
        conversion: `${convRate}%`
      };
    });

    // 4. Calculate Final Averages
    const avgReadTimeVal = blogCount > 0 ? Math.round(totalReadTime / blogCount) : 0;
    
    // Global Conversion Rate: (Total Shares / Total Views) * 100
    // You can also use (Total Conversions / Total Views) if you track button clicks specifically
    const globalConversionRate = totalViews > 0 
      ? ((totalShares / totalViews) * 100).toFixed(1) 
      : "0.0";

    // 5. Sort Top Performers (Highest Views)
    const topBlogs = processedBlogs.sort((a, b) => b.views - a.views).slice(0, 5);
    const topStories = processedStories.sort((a, b) => b.views - a.views).slice(0, 5);

    // 6. Calculate Distribution Percentages
    const totalItems = blogs.length + stories.length;
    const storyPercent = totalItems > 0 ? Math.round((stories.length / totalItems) * 100) : 0;
    const blogPercent = totalItems > 0 ? 100 - storyPercent : 0;

    // 7. Send Response
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalViews,
          totalShares,
          avgReadTime: `${avgReadTimeVal} min`,
          conversionRate: `${globalConversionRate}%`
        },
        topBlogs,
        topStories,
        distribution: {
          blogPercent,
          storyPercent
        }
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};




exports.chnageNoteVisibility = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { visibility } = req.body;

    // 1. Validate Input
    const validStatuses = ["public", "private", "unlisted"];
    if (!visibility || !validStatuses.includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: `Invalid visibility. Allowed values: ${validStatuses.join(", ")}`
      });
    }

    // 2. Find and Update Note
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { visibility: visibility },
      { new: true } // Return the updated document
    ).select('title visibility slug'); // Select specific fields to return

    // 3. Handle Not Found
    if (!updatedNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    // 4. Success Response
    return res.status(200).json({
      success: true,
      message: `Note visibility updated to ${visibility}`,
      data: updatedNote
    });

  } catch (error) {
    console.error("❌ Error changing note visibility:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating visibility",
      error: error.message
    });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    // 1. Find and Delete Note
    const deletedNote = await Note.findByIdAndDelete(noteId);

    // 2. Handle Not Found
    if (!deletedNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // 3. Success Response
    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      data: { _id: deletedNote._id, title: deletedNote.title }
    });

  } catch (error) {
    console.error("❌ Error deleting note:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting note",
      error: error.message,
    });
  }
};




const ToolAnalytics = require("../models/ToolAnalytics");

// Get aggregated analytics for the Admin Dashboard
exports.getToolAnalytics = async (req, res) => {
  try {
    // 1. Total Metrics
    const totalInteractions = await ToolAnalytics.countDocuments();
    const totalViews = await ToolAnalytics.countDocuments({ eventType: 'view' });
    const totalClicks = await ToolAnalytics.countDocuments({ eventType: 'click' });

    // 2. Top Performing Tools (Aggregation)
    const topTools = await ToolAnalytics.aggregate([
      { $match: { eventType: 'view' } }, // Count actual page views
      { $group: { _id: "$toolName", count: { $sum: 1 }, category: { $first: "$category" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 3. Traffic Sources
    const trafficSources = await ToolAnalytics.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Device Breakdown
    const deviceStats = await ToolAnalytics.aggregate([
      { $group: { _id: "$device", count: { $sum: 1 } } }
    ]);

    // 5. Recent Live Activity
    const recentActivity = await ToolAnalytics.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('userId', 'name email') // If you want user details
      .lean();

    res.status(200).json({
      success: true,
      data: {
        totals: {
          interactions: totalInteractions,
          views: totalViews,
          clicks: totalClicks
        },
        topTools,
        trafficSources,
        deviceStats,
        recentActivity
      }
    });

  } catch (error) {
    console.error("Analytics Aggregation Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};