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
const Report = require("../models/Report");
const Comment = require("../models/Comment");

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


// @desc    Get all comments with filtering and pagination
// @route   GET /api/admin/comments
// @access  Private/Admin
exports.getAllComments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = "",
      noteId,
      userId,
      isAiResponse,
      sortBy = "newest"
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    let filter = {};
    if (noteId) filter.note = noteId;
    if (userId) filter.user = userId;
    if (isAiResponse !== undefined) filter.isAiResponse = isAiResponse === 'true';
    
    // Search in content
    if (search) {
      filter.$or = [
        { content: { $regex: search, $options: 'i' } },
        { 'replies.content': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = {};
    switch(sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'most_liked':
        sort = { likes: -1 };
        break;
      case 'most_replies':
        sort = { replyCount: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Get comments with aggregation for reply count
    const comments = await Comment.aggregate([
      { $match: filter },
      {
        $addFields: {
          replyCount: { $size: "$replies" }
        }
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "notes",
          localField: "note",
          foreignField: "_id",
          as: "noteDetails"
        }
      },
      { $unwind: { path: "$noteDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "replies.user",
          foreignField: "_id",
          as: "replyUsers"
        }
      }
    ]);

    // Get total count
    const total = await Comment.countDocuments(filter);

    // Get statistics
    const stats = {
      totalComments: await Comment.countDocuments(),
      totalReplies: await Comment.aggregate([
        { $group: { _id: null, totalReplies: { $sum: { $size: "$replies" } } } }
      ]).then(res => res[0]?.totalReplies || 0),
      aiComments: await Comment.countDocuments({ isAiResponse: true }),
      totalLikes: await Comment.aggregate([
        { $group: { _id: null, totalLikes: { $sum: "$likes" } } }
      ]).then(res => res[0]?.totalLikes || 0),
      recentActivity: await Comment.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    };

    res.status(200).json({
      success: true,
      data: {
        comments,
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
    console.error("❌ Get All Comments Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching comments",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single comment by ID
// @route   GET /api/admin/comments/:id
// @access  Private/Admin
exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('user', 'name email username picture')
      .populate('note', 'title slug visibility')
      .populate('replies.user', 'name email username picture')
      .lean();

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Get note details
    const note = await Note.findById(comment.note)
      .select('title owner views likes')
      .populate('owner', 'name email');

    res.status(200).json({
      success: true,
      data: { ...comment, noteDetails: note }
    });

  } catch (error) {
    console.error("❌ Get Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching comment"
    });
  }
};

// @desc    Update comment content
// @route   PATCH /api/admin/comments/:id
// @access  Private/Admin
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const commentId = req.params.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Content cannot be empty"
      });
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { 
        content: content.trim(),
        editedBy: req.user._id,
        editedAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment
    });

  } catch (error) {
    console.error("❌ Update Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating comment"
    });
  }
};

// @desc    Delete comment (and all its replies)
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment and all replies deleted successfully",
      data: { _id: comment._id }
    });

  } catch (error) {
    console.error("❌ Delete Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting comment"
    });
  }
};

// @desc    Update a reply
// @route   PATCH /api/admin/comments/:commentId/replies/:replyId
// @access  Private/Admin
exports.updateReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Content cannot be empty"
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Find and update the reply
    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found"
      });
    }

    reply.content = content.trim();
    reply.editedBy = req.user._id;
    reply.editedAt = new Date();

    await comment.save();

    res.status(200).json({
      success: true,
      message: "Reply updated successfully",
      data: reply
    });

  } catch (error) {
    console.error("❌ Update Reply Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating reply"
    });
  }
};

// @desc    Delete a reply
// @route   DELETE /api/admin/comments/:commentId/replies/:replyId
// @access  Private/Admin
exports.deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Remove the reply
    comment.replies = comment.replies.filter(
      reply => reply._id.toString() !== replyId
    );

    await comment.save();

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully"
    });

  } catch (error) {
    console.error("❌ Delete Reply Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting reply"
    });
  }
};

// @desc    Bulk delete comments
// @route   POST /api/admin/comments/bulk-delete
// @access  Private/Admin
exports.bulkDeleteComments = async (req, res) => {
  try {
    const { commentIds } = req.body;

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of comment IDs"
      });
    }

    const result = await Comment.deleteMany({ _id: { $in: commentIds } });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} comments`,
      data: { deletedCount: result.deletedCount }
    });

  } catch (error) {
    console.error("❌ Bulk Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while bulk deleting comments"
    });
  }
};

// @desc    Get comments for a specific note
// @route   GET /api/admin/comments/note/:noteId
// @access  Private/Admin
exports.getNoteComments = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find({ note: noteId })
      .populate('user', 'name email username picture')
      .populate('replies.user', 'name email username picture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Comment.countDocuments({ note: noteId });

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error("❌ Get Note Comments Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching note comments"
    });
  }
};

// @desc    Get comment analytics
// @route   GET /api/admin/comments/analytics
// @access  Private/Admin
exports.getCommentAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    // Comments over time
    const commentsOverTime = await Comment.aggregate([
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

    // Top commenters
    const topCommenters = await Comment.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 } } },
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
          "userInfo.username": 1,
          "userInfo.picture": 1
        }
      }
    ]);

    // Most commented notes
    const topNotes = await Comment.aggregate([
      { $group: { _id: "$note", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "notes",
          localField: "_id",
          foreignField: "_id",
          as: "noteInfo"
        }
      },
      { $unwind: "$noteInfo" },
      {
        $project: {
          count: 1,
          "noteInfo.title": 1,
          "noteInfo.slug": 1,
          "noteInfo.views": 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        timeline: commentsOverTime,
        topCommenters,
        topNotes,
        totalComments: await Comment.countDocuments({ createdAt: { $gte: dateLimit } })
      }
    });

  } catch (error) {
    console.error("❌ Comment Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics"
    });
  }
};