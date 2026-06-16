const Note = require("../models/Note");
const User = require("../models/User");
const FlashcardSet = require("../models/FlashcardSet");
const Quiz = require("../models/Quiz");
const Transaction = require("../models/Transaction");
const Analytics = require("../models/Analytics");
const Bug = require("../models/Bug");
const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");

const SuccessStory = require('../models/SuccessStory');
const BlogPost = require('../models/BlogPost');
const Report = require("../models/Report");

const r2Service = require("../utils/r2Service");
const Presentation = require("../models/Presentation");
const Diagram = require("../models/Diagram");
const Essay = require("../models/Essay");
const AiChat = require("../models/AiChat");
const PracticeTest = require("../models/PracticeTest");
const Folder = require("../models/Folder");


exports.getDiagnostics = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // ── 1. ALL COUNTS IN PARALLEL ──
    const [
      totalUsers,
      totalNotes,
      totalPresentations,
      totalFlashcards,
      totalQuizzes,
      totalPracticeTests,
      totalDiagrams,
      totalEssays,
      totalAiChats,
      totalFolders,
      totalTransactionCount,
      openBugs,
      pendingFeedback,
      todaySignups,
      premiumUsers,
      revenueAgg,
      sourceDistribution,
      dailySignups,
      planDistribution,
      mapUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      Presentation.countDocuments(),
      FlashcardSet.countDocuments(),
      Quiz.countDocuments(),
      PracticeTest.countDocuments(),
      Diagram.countDocuments(),
      Essay.countDocuments(),
      AiChat.countDocuments(),
      Folder.countDocuments(),
      Transaction.countDocuments({ status: "success" }),
      Bug.countDocuments({ status: { $ne: "resolved" } }),
      Feedback.countDocuments({ status: "pending" }),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ "membership.isActive": true }),
      Transaction.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
      ]),
      Analytics.aggregate([
        { $group: { _id: "$source", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
      ]),
      User.aggregate([
        { $match: { "membership.isActive": true } },
        { $group: { _id: "$membership.planId", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.find({ "location.latitude": { $ne: null } }).select("name email membership.isActive location picture").lean()
    ]);

    // ── 2. RECENT CREATIONS ACROSS ALL TOOL TYPES (no populate — avoids strictPopulate errors) ──
    const [recentNotes, recentPPTs, recentFlashcards, recentQuizzes] = await Promise.all([
      Note.find().sort({ createdAt: -1 }).limit(4).select('title createdAt owner').lean(),
      Presentation.find().sort({ createdAt: -1 }).limit(3).select('title createdAt owner').lean(),
      FlashcardSet.find().sort({ createdAt: -1 }).limit(3).select('title createdAt owner').lean(),
      Quiz.find().sort({ createdAt: -1 }).limit(3).select('title createdAt userId').lean(),
    ]);

    // Collect all unique user IDs for a single bulk lookup
    const userIdSet = new Set([
      ...recentNotes.map(n => n.owner?.toString()).filter(Boolean),
      ...recentPPTs.map(p => p.owner?.toString()).filter(Boolean),
      ...recentFlashcards.map(f => f.owner?.toString()).filter(Boolean),
      ...recentQuizzes.map(q => q.userId?.toString()).filter(Boolean),
    ]);
    const userDocs = await User.find({ _id: { $in: [...userIdSet] } }).select('name email picture').lean();
    const userMap = Object.fromEntries(userDocs.map(u => [u._id.toString(), u]));

    const resolveUser = (id) => id ? (userMap[id.toString()] || null) : null;

    // ── 3. CONSTRUCT RESPONSE ──
    const totalRevenue = revenueAgg[0]?.total || 0;
    const totalContent = totalNotes + totalPresentations + totalFlashcards + totalQuizzes + totalPracticeTests + totalDiagrams + totalEssays;
    const freeUsers = totalUsers - premiumUsers;

    const recentCreations = [
      ...recentNotes.map(n => ({ _id: n._id, title: n.title, type: 'note', owner: resolveUser(n.owner), createdAt: n.createdAt })),
      ...recentPPTs.map(p => ({ _id: p._id, title: p.title, type: 'presentation', owner: resolveUser(p.owner), createdAt: p.createdAt })),
      ...recentFlashcards.map(f => ({ _id: f._id, title: f.title, type: 'flashcard', owner: resolveUser(f.owner), createdAt: f.createdAt })),
      ...recentQuizzes.map(q => ({ _id: q._id, title: q.title, type: 'quiz', owner: resolveUser(q.userId), createdAt: q.createdAt })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);



    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        todaySignups,
        premiumUsers,
        freeUsers,
        planDistribution,
        dailySignups,
        totalNotes,
        totalPresentations,
        totalFlashcards,
        totalQuizzes,
        totalPracticeTests,
        totalDiagrams,
        totalEssays,
        totalAiChats,
        totalFolders,
        totalContent,
        totalRevenue,
        totalTransactions: totalTransactionCount,
        avgOrderValue: totalTransactionCount > 0 ? Math.round(totalRevenue / totalTransactionCount) : 0,
        openBugs,
        pendingFeedback,
        sourceDistribution,
        contentBreakdown: [
          { label: "Notes", count: totalNotes, color: "#3b82f6", icon: "note" },
          { label: "Presentations", count: totalPresentations, color: "#a855f7", icon: "ppt" },
          { label: "Flashcards", count: totalFlashcards, color: "#f59e0b", icon: "flashcard" },
          { label: "Quizzes", count: totalQuizzes, color: "#10b981", icon: "quiz" },
          { label: "Practice Tests", count: totalPracticeTests, color: "#ef4444", icon: "test" },
          { label: "Diagrams", count: totalDiagrams, color: "#06b6d4", icon: "diagram" },
          { label: "Essays", count: totalEssays, color: "#f97316", icon: "essay" },
          { label: "AI Chats", count: totalAiChats, color: "#8b5cf6", icon: "chat" },
        ],
         last5Creations: { notes: recentNotes.slice(0, 5) },
        recentCreations,
        mapUsers,
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
    const users = await User.find().select('name email membership joinedAt picture location').lean();
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
    const { response, status, name, email, rating, quote, location } = req.body;
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found."
      });
    }
    
    if (response !== undefined) {
      feedback.adminResponse = response;
      feedback.respondedAt = new Date();
    }
    if (status !== undefined) feedback.status = status;
    if (name !== undefined) feedback.name = name;
    if (email !== undefined) feedback.email = email;
    if (rating !== undefined) feedback.rating = rating;
    if (quote !== undefined) feedback.quote = quote;
    if (location !== undefined) feedback.location = location;

    await feedback.save();
    res.status(200).json({
      success: true,
      message: "Feedback updated successfully."
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


// @desc    Get all reports with filtering
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getAllReports = async (req, res) => {
  try {
    const { status, reason, page = 1, limit = 20 } = req.query;
    
    // Build filter object
    let filter = {};
    if (status) filter.status = status;
    if (reason) filter.reason = reason;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch reports with populated user data
    const reports = await Report.find(filter)
      .populate('reporter', 'name email username picture')
      .populate('reportedUser', 'name email username picture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Report.countDocuments(filter);

    // Calculate statistics
    const stats = {
      pending: await Report.countDocuments({ status: 'pending' }),
      reviewed: await Report.countDocuments({ status: 'reviewed' }),
      resolved: await Report.countDocuments({ status: 'resolved' }),
      total: total,
      byReason: await Report.aggregate([
        { $group: { _id: "$reason", count: { $sum: 1 } } }
      ])
    };

    res.status(200).json({
      success: true,
      data: {
        reports,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error("❌ Get Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reports",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single report by ID
// @route   GET /api/admin/reports/:id
// @access  Private/Admin
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name email username picture joinedAt')
      .populate('reportedUser', 'name email username picture joinedAt tokens membership');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error("❌ Get Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching report"
    });
  }
};

// @desc    Update report status
// @route   PATCH /api/admin/reports/:id
// @access  Private/Admin
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, adminNotes, action } = req.body;
    const reportId = req.params.id;

    const validStatuses = ['pending', 'reviewed', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    // Update report
    report.status = status;
    if (adminNotes) {
      report.adminNotes = adminNotes;
    }
    report.reviewedAt = new Date();
    report.reviewedBy = req.user._id;

    // If action is taken against reported user
    if (action && status === 'resolved') {
      report.actionTaken = action;
      
      // Optionally apply action to reported user
      if (action.type === 'warn') {
        // Add warning to user profile (you might want to add a warnings field to User model)
        await User.findByIdAndUpdate(report.reportedUser, {
          $push: { warnings: { date: new Date(), reason: report.reason, reportId: report._id } }
        });
      } else if (action.type === 'suspend') {
        // Suspend user account
        await User.findByIdAndUpdate(report.reportedUser, {
          isSuspended: true,
          suspendedUntil: action.until,
          suspensionReason: report.reason
        });
      } else if (action.type === 'ban') {
        // Ban user permanently
        await User.findByIdAndUpdate(report.reportedUser, {
          isBanned: true,
          bannedAt: new Date(),
          banReason: report.reason
        });
      }
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: `Report status updated to ${status}`,
      data: report
    });

  } catch (error) {
    console.error("❌ Update Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating report"
    });
  }
};

// @desc    Delete report
// @route   DELETE /api/admin/reports/:id
// @access  Private/Admin
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Report deleted successfully"
    });

  } catch (error) {
    console.error("❌ Delete Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting report"
    });
  }
};

// @desc    Get user report history
// @route   GET /api/admin/reports/user/:userId
// @access  Private/Admin
exports.getUserReports = async (req, res) => {
  try {
    const { userId } = req.params;

    // Reports filed BY this user
    const filedReports = await Report.find({ reporter: userId })
      .populate('reportedUser', 'name email username')
      .sort({ createdAt: -1 })
      .limit(20);

    // Reports filed AGAINST this user
    const againstReports = await Report.find({ reportedUser: userId })
      .populate('reporter', 'name email username')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        filed: filedReports,
        against: againstReports,
        totalFiled: filedReports.length,
        totalAgainst: againstReports.length
      }
    });

  } catch (error) {
    console.error("❌ Get User Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user reports"
    });
  }
};

// @desc    Get reports analytics
// @route   GET /api/admin/reports/analytics
// @access  Private/Admin
exports.getReportsAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    // Reports over time
    const reportsOverTime = await Report.aggregate([
      { $match: { createdAt: { $gte: dateLimit } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Most reported users
    const mostReportedUsers = await Report.aggregate([
      { $group: { _id: "$reportedUser", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          count: 1,
          "userInfo.name": 1,
          "userInfo.email": 1,
          "userInfo.username": 1
        }
      }
    ]);

    // Most active reporters
    const topReporters = await Report.aggregate([
      { $group: { _id: "$reporter", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          count: 1,
          "userInfo.name": 1,
          "userInfo.email": 1,
          "userInfo.username": 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        timeline: reportsOverTime,
        mostReportedUsers,
        topReporters,
        totalReports: await Report.countDocuments({ createdAt: { $gte: dateLimit } })
      }
    });

  } catch (error) {
    console.error("❌ Reports Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics"
    });
  }
};


exports.getTopReportedUsers = async (req, res) => {
  try {
    const topReported = await Report.aggregate([
      { $group: { 
        _id: "$reportedUser", 
        count: { $sum: 1 },
        recentReports: { $push: { 
          _id: "$_id",
          reason: "$reason",
          status: "$status",
          createdAt: "$createdAt"
        }}
      }},
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          count: 1,
          recentReports: { $slice: ["$recentReports", 3] }, // Only last 3 reports
          "userInfo._id": 1,
          "userInfo.name": 1,
          "userInfo.email": 1,
          "userInfo.username": 1,
          "userInfo.picture": 1,
          "userInfo.joinedAt": 1,
          "userInfo.membership": 1,
          "userInfo.tokens": 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: topReported
    });
  } catch (error) {
    console.error("❌ Get Top Reported Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching top reported users"
    });
  }
};


// Comment system has been permanently decommissioned.
// All comment admin endpoints removed.


exports.getPresignedUrl = async (req, res) => {
  try {
    const { fileName, contentType, folder } = req.body;
    const { uploadUrl, publicUrl } = await r2Service.generatePresignedUploadUrl(
      fileName,
      contentType,
      folder || 'admin-uploads'
    );
    res.status(200).json({ success: true, data: { uploadUrl, publicUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN SUBSCRIPTION & TOKEN MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// Valid plan configs (mirrors paymentController)
const ADMIN_SUBSCRIPTION_PLANS = {
  scholar:       { name: "Scholar Plan",        durationDays: { monthly: 30,  yearly: 365 } },
  pro:           { name: "Pro Scholar Plan",    durationDays: { monthly: 30,  yearly: 365 } },
  power:         { name: "Power Scholar Plan",  durationDays: { monthly: 30,  yearly: 365 } },
};

/**
 * GET /api/admin/users/details
 * Returns ALL users with full membership + token info for admin panel.
 */
exports.adminGetAllUsersDetailed = async (req, res) => {
  try {
    const { search, page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    if (search && search.trim()) {
      const q = search.trim();
      filter = {
        $or: [
          { name:  { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { username: { $regex: q, $options: "i" } }
        ]
      };
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email username picture joinedAt tokens membership isFake location")
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages:  Math.ceil(total / parseInt(limit)),
        totalItems:  total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("❌ Admin Get All Users Detailed Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching users." });
  }
};

/**
 * GET /api/admin/user/:userId/details
 * Full profile: membership, tokens, recent transactions.
 */
exports.adminGetUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format." });
    }

    const user = await User.findById(userId)
      .select("name email username picture joinedAt tokens membership tokenUsageHistory transactions isFake")
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Sort transactions newest-first, return last 20
    const recentTransactions = (user.transactions || [])
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);

    res.status(200).json({
      success: true,
      data: {
        _id:         user._id,
        name:        user.name,
        email:       user.email,
        username:    user.username,
        picture:     user.picture,
        joinedAt:    user.joinedAt,
        tokens:      user.tokens ?? 0,
        membership:  user.membership || null,
        recentTransactions,
        isFake:      user.isFake
      }
    });
  } catch (error) {
    console.error("❌ Admin Get User Details Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching user details." });
  }
};

/**
 * POST /api/admin/user/:userId/grant-subscription
 * Body: { planId, billingPeriod, durationDays?, note? }
 *
 * Grants (or extends) a subscription for a user manually.
 * Creates an internal transaction record tagged as paymentMethod = "admin_grant".
 */
exports.adminGrantSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      planId,
      billingPeriod = "monthly",
      durationDays,          // optional override (in days)
      note = ""              // optional admin note
    } = req.body;

    // ── Validation ──────────────────────────────────────────────
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format." });
    }

    if (!planId) {
      return res.status(400).json({ success: false, message: "planId is required." });
    }

    const planConfig = ADMIN_SUBSCRIPTION_PLANS[planId.toLowerCase()];
    if (!planConfig) {
      return res.status(400).json({
        success: false,
        message: `Invalid planId. Valid plans: ${Object.keys(ADMIN_SUBSCRIPTION_PLANS).join(", ")}`
      });
    }

    const validPeriods = ["monthly", "yearly"];
    if (!validPeriods.includes(billingPeriod)) {
      return res.status(400).json({ success: false, message: "billingPeriod must be 'monthly' or 'yearly'." });
    }

    // Resolve duration
    const resolvedDays = durationDays
      ? parseInt(durationDays)
      : planConfig.durationDays[billingPeriod];

    if (isNaN(resolvedDays) || resolvedDays < 1) {
      return res.status(400).json({ success: false, message: "durationDays must be a positive number." });
    }

    // ── Find User ────────────────────────────────────────────────
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // ── Compute Expiry ───────────────────────────────────────────
    const now        = new Date();
    const currentExp = user.membership?.isActive && user.membership?.expiresAt
      ? new Date(user.membership.expiresAt)
      : null;
    const baseDate   = currentExp && currentExp > now ? currentExp : now;
    const expiresAt  = new Date(baseDate.getTime() + resolvedDays * 24 * 60 * 60 * 1000);

    // ── Update Membership ────────────────────────────────────────
    user.membership = {
      isActive:      true,
      planId:        planId.toLowerCase(),
      planName:      planConfig.name,
      billingPeriod: billingPeriod,
      startedAt:     user.membership?.startedAt || now,
      expiresAt:     expiresAt,
      lastPaymentId: `admin_grant_${Date.now()}`,
      autoRenew:     false
    };

    // ── Create Internal Transaction Record ───────────────────────
    const txnRecord = {
      paymentId:    `admin_grant_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      orderId:      `admin_order_${Date.now()}`,
      signature:    "",
      packageId:    planId.toLowerCase(),
      packageName:  planConfig.name,
      packageType:  "subscription",
      billingPeriod: billingPeriod,
      amount:       0,
      baseAmount:   0,
      discountAmount: 0,
      gstAmount:    0,
      tokens:       null,
      status:       "success",
      couponCode:   null,
      paymentMethod: "admin_grant",
      userEmail:    user.email,
      userName:     user.name,
      packageMeta:  {
        adminGrantedBy: req.user?.email || "admin",
        note:           note,
        durationDays:   resolvedDays
      },
      timestamp:    now
    };

    if (!user.transactions) user.transactions = [];
    user.transactions.push(txnRecord);

    // Also log into tokenUsageHistory for timeline visibility
    if (!user.tokenUsageHistory) user.tokenUsageHistory = [];
    user.tokenUsageHistory.push({
      name:   `[Admin Grant] ${planConfig.name} (${billingPeriod}) — ${resolvedDays} days`,
      tokens: 0,
      date:   now
    });

    await user.save();

    // ── Save to Standalone Transaction collection ─────────────────
    try {
      await Transaction.create({ ...txnRecord, userId: user._id });
    } catch (txnErr) {
      console.warn("⚠️ Could not save standalone transaction for admin grant:", txnErr.message);
    }

    console.log(`✅ [Admin] Subscription granted → ${user.email} | Plan: ${planId} | Expires: ${expiresAt.toISOString()} | By: ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: `Subscription "${planConfig.name}" granted successfully.`,
      data: {
        userId:      user._id,
        email:       user.email,
        membership:  user.membership,
        grantedBy:   req.user?.email,
        durationDays: resolvedDays
      }
    });

  } catch (error) {
    console.error("❌ Admin Grant Subscription Error:", error);
    res.status(500).json({ success: false, message: "Server error while granting subscription.", error: error.message });
  }
};

/**
 * POST /api/admin/user/:userId/grant-tokens
 * Body: { amount, note? }
 *
 * Adds tokens to a user's balance manually.
 */
exports.adminGrantTokens = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, note = "" } = req.body;

    // ── Validation ──────────────────────────────────────────────
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format." });
    }

    const tokenAmount = parseInt(amount);
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
      return res.status(400).json({ success: false, message: "amount must be a positive integer." });
    }

    if (tokenAmount > 100000) {
      return res.status(400).json({ success: false, message: "Cannot grant more than 100,000 tokens at once." });
    }

    // ── Find User ────────────────────────────────────────────────
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const previousBalance = user.tokens ?? 0;

    // ── Add Tokens ───────────────────────────────────────────────
    user.tokens = previousBalance + tokenAmount;

    // ── Log to tokenUsageHistory ─────────────────────────────────
    if (!user.tokenUsageHistory) user.tokenUsageHistory = [];
    user.tokenUsageHistory.push({
      name:   `[Admin Grant] +${tokenAmount} Tokens${note ? ` — ${note}` : ""}`,
      tokens: tokenAmount,
      date:   new Date()
    });

    // ── Create Internal Transaction Record ───────────────────────
    const now = new Date();
    const txnRecord = {
      paymentId:    `admin_token_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      orderId:      `admin_token_order_${Date.now()}`,
      signature:    "",
      packageId:    "admin_token_grant",
      packageName:  `Admin Token Grant (+${tokenAmount})`,
      packageType:  "token",
      amount:       0,
      baseAmount:   0,
      discountAmount: 0,
      gstAmount:    0,
      tokens:       tokenAmount,
      status:       "success",
      couponCode:   null,
      paymentMethod: "admin_grant",
      userEmail:    user.email,
      userName:     user.name,
      packageMeta:  {
        adminGrantedBy: req.user?.email || "admin",
        note:           note,
        tokensGranted:  tokenAmount,
        previousBalance
      },
      timestamp: now
    };

    if (!user.transactions) user.transactions = [];
    user.transactions.push(txnRecord);

    await user.save();

    // ── Save to Standalone Transaction collection ─────────────────
    try {
      await Transaction.create({ ...txnRecord, userId: user._id });
    } catch (txnErr) {
      console.warn("⚠️ Could not save standalone transaction for token grant:", txnErr.message);
    }

    console.log(`✅ [Admin] Tokens granted → ${user.email} | +${tokenAmount} tokens | New balance: ${user.tokens} | By: ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: `${tokenAmount} tokens granted successfully.`,
      data: {
        userId:          user._id,
        email:           user.email,
        tokensGranted:   tokenAmount,
        previousBalance: previousBalance,
        newBalance:      user.tokens,
        grantedBy:       req.user?.email
      }
    });

  } catch (error) {
    console.error("❌ Admin Grant Tokens Error:", error);
    res.status(500).json({ success: false, message: "Server error while granting tokens.", error: error.message });
  }
};

/**
 * POST /api/admin/user/:userId/revoke-subscription
 * Body: { note? }
 *
 * Immediately cancels a user's active subscription.
 */
exports.adminRevokeSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { note = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!user.membership?.isActive) {
      return res.status(400).json({ success: false, message: "User does not have an active subscription." });
    }

    const previousPlan = { ...user.membership.toObject ? user.membership.toObject() : user.membership };

    // ── Revoke ───────────────────────────────────────────────────
    user.membership.isActive  = false;
    user.membership.expiresAt = new Date(); // expire immediately

    // ── Log ──────────────────────────────────────────────────────
    if (!user.tokenUsageHistory) user.tokenUsageHistory = [];
    user.tokenUsageHistory.push({
      name:   `[Admin Revoke] ${previousPlan.planName} cancelled${note ? ` — ${note}` : ""}`,
      tokens: 0,
      date:   new Date()
    });

    await user.save();

    console.log(`🚫 [Admin] Subscription revoked → ${user.email} | Plan: ${previousPlan.planName} | By: ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: `Subscription "${previousPlan.planName}" has been revoked.`,
      data: {
        userId:      user._id,
        email:       user.email,
        revokedPlan: previousPlan,
        revokedBy:   req.user?.email
      }
    });

  } catch (error) {
    console.error("❌ Admin Revoke Subscription Error:", error);
    res.status(500).json({ success: false, message: "Server error while revoking subscription.", error: error.message });
  }
};

/**
 * POST /api/admin/user/:userId/set-tokens
 * Body: { amount, note? }
 *
 * Sets a user's token balance to an exact value (override, not increment).
 */
exports.adminSetTokenBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, note = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format." });
    }

    const tokenAmount = parseInt(amount);
    if (isNaN(tokenAmount) || tokenAmount < 0) {
      return res.status(400).json({ success: false, message: "amount must be a non-negative integer." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const previousBalance = user.tokens ?? 0;
    user.tokens = tokenAmount;

    if (!user.tokenUsageHistory) user.tokenUsageHistory = [];
    user.tokenUsageHistory.push({
      name:   `[Admin Set] Balance set to ${tokenAmount}${note ? ` — ${note}` : ""}`,
      tokens: tokenAmount - previousBalance,
      date:   new Date()
    });

    await user.save();

    console.log(`⚙️ [Admin] Token balance set → ${user.email} | ${previousBalance} → ${tokenAmount} | By: ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: `Token balance set to ${tokenAmount}.`,
      data: {
        userId:          user._id,
        email:           user.email,
        previousBalance,
        newBalance:      user.tokens,
        setBy:           req.user?.email
      }
    });

  } catch (error) {
    console.error("❌ Admin Set Token Balance Error:", error);
    res.status(500).json({ success: false, message: "Server error while setting token balance.", error: error.message });
  }
};

/**
 * GET /api/admin/ai-models/analytics
 *
 * Compiles stats and details for the 4 generation AI models (Flash, Canvas, Scholar, Atlas).
 */
exports.getAiModelsAnalytics = async (req, res) => {
  try {
    // 1. Group stats by model
    const modelStats = await Note.aggregate([
      {
        $group: {
          _id: "$generationDetails.model",
          count: { $sum: 1 },
          avgProcessingTime: { $avg: "$generationDetails.processingTime" },
          totalProcessingTime: { $sum: "$generationDetails.processingTime" },
          totalTokensCost: { $sum: "$generationDetails.cost" },
          successCount: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
          },
          processingCount: {
            $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] }
          }
        }
      }
    ]);

    // 2. Daily trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyStats = await Note.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            model: "$generationDetails.model"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Format daily trend data
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const dailyTrend = dates.map(date => {
      const row = { date };
      row.flash = 0;
      row.canvas = 0;
      row.scholar = 0;
      row.atlas = 0;
      
      dailyStats.forEach(stat => {
        if (stat._id.date === date && stat._id.model) {
          const modelKey = stat._id.model.toLowerCase();
          if (["flash", "canvas", "scholar", "atlas"].includes(modelKey)) {
            row[modelKey] = stat.count || 0;
          }
        }
      });
      return row;
    });

    // Map aggregated statistics
    const statsMap = {};
    modelStats.forEach(stat => {
      if (stat._id) {
        statsMap[stat._id.toLowerCase()] = {
          count: stat.count || 0,
          avgProcessingTime: Math.round((stat.avgProcessingTime || 0) * 10) / 10,
          totalProcessingTime: stat.totalProcessingTime || 0,
          totalTokensCost: stat.totalTokensCost || 0,
          successCount: stat.successCount || 0,
          failedCount: stat.failedCount || 0,
          processingCount: stat.processingCount || 0,
        };
      }
    });

    // Merge static details with dynamic DB stats
    const modelsData = [
      {
        id: "flash",
        name: "Flash",
        tier: "Free Tier",
        color: "emerald",
        description: "The fastest way to turn a lecture into clean notes. Flash produces distraction-free, bullet-format notes with bold terms and definitions auto-detected.",
        tokenCost: 5,
        maxVideoLength: "1 hour",
        speed: "Under 30 seconds",
        capabilities: [
          "Clean, academic bullet layout",
          "Auto-detected bold terms & definitions",
          "Quick summary at the top",
          "Under 30-second generation speed",
          "Supports videos up to 1 hour"
        ],
        ...(statsMap["flash"] || { count: 0, avgProcessingTime: 0, totalProcessingTime: 0, totalTokensCost: 0, successCount: 0, failedCount: 0, processingCount: 0 })
      },
      {
        id: "canvas",
        name: "Canvas",
        tier: "Pro Tier",
        color: "blue",
        description: "Canvas creates modern study cards that feel like a magazine. It integrates contextual images (Unsplash) and video timestamps back to specific segments, perfect for visual learners.",
        tokenCost: 0,
        maxVideoLength: "4 hours",
        speed: "Pro-tier standard speed",
        capabilities: [
          "Section card-based visual layouts",
          "Curated images matching each concept",
          "Timestamps linked back to the video",
          "Pro-tier generation quality",
          "Supports videos up to 4 hours"
        ],
        ...(statsMap["canvas"] || { count: 0, avgProcessingTime: 0, totalProcessingTime: 0, totalTokensCost: 0, successCount: 0, failedCount: 0, processingCount: 0 })
      },
      {
        id: "scholar",
        name: "Scholar",
        tier: "Pro Tier",
        color: "purple",
        description: "Scholar produces textbook-quality notes formatted for PDF export. It auto-generates a table of contents, definitions boxes, data tables, and deep comparative grids.",
        tokenCost: 0,
        maxVideoLength: "4 hours",
        speed: "Pro-tier advanced speed",
        capabilities: [
          "Auto-generated table of contents",
          "H1 → H2 → H3 heading structures",
          "Key definitions box per section",
          "Data tables for comparisons",
          "Clean PDF and Markdown exports"
        ],
        ...(statsMap["scholar"] || { count: 0, avgProcessingTime: 0, totalProcessingTime: 0, totalTokensCost: 0, successCount: 0, failedCount: 0, processingCount: 0 })
      },
      {
        id: "atlas",
        name: "Atlas",
        tier: "Power Tier",
        color: "red",
        description: "Designed for power users processing massive YouTube courses, playlists, or conference talks. Atlas offers chapter-by-chapter breakdowns, cross-section concept linking, and full PDF + Anki deck exports.",
        tokenCost: 0,
        maxVideoLength: "12 hours (Playlists)",
        speed: "Dedicated processing queue",
        capabilities: [
          "Processes entire courses & playlists",
          "Chunked processing handles any length",
          "Chapter-by-chapter breakdown",
          "Cross-section concept linking",
          "Full PDF + Anki deck (.apkg) exports"
        ],
        ...(statsMap["atlas"] || { count: 0, avgProcessingTime: 0, totalProcessingTime: 0, totalTokensCost: 0, successCount: 0, failedCount: 0, processingCount: 0 })
      }
    ];

    res.status(200).json({
      success: true,
      models: modelsData,
      dailyTrend
    });
  } catch (error) {
    console.error("❌ getAiModelsAnalytics Error:", error);
    res.status(500).json({ success: false, message: "Server error while gathering AI models telemetry.", error: error.message });
  }
};

