const Note = require("../models/Note");
const User = require("../models/User");
const FlashcardSet = require("../models/FlashcardSet");
const Quiz = require("../models/Quiz");
const Transaction = require("../models/Transaction"); // You need to create this model
const mongoose = require("mongoose");
exports.getDiagnostics = async (req, res) => {
  try {
    // Get time ranges for analytics
    const now = new Date();
    const last24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const last7Days = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // 1. Get total users count
    const totalUsers = await User.countDocuments();
    const newUsersLast24h = await User.countDocuments({ 
      createdAt: { $gte: last24Hours } 
    });
    const newUsersLast7d = await User.countDocuments({ 
      createdAt: { $gte: last7Days } 
    });

    // 2. Get user growth trend (last 7 days)
    const userGrowthData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const dailyUsers = await User.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      userGrowthData.push({
        date: startOfDay.toISOString().split('T')[0],
        count: dailyUsers
      });
    }

    // 3. Get total notes count with breakdown
    const totalNotes = await Note.countDocuments();
    const publicNotes = await Note.countDocuments({ visibility: 'public' });
    const privateNotes = await Note.countDocuments({ visibility: 'private' });
    const unlistedNotes = await Note.countDocuments({ visibility: 'unlisted' });
    
    const notesLast24h = await Note.countDocuments({ 
      createdAt: { $gte: last24Hours } 
    });

    // 4. Get notes by generation type
    const freeNotes = await Note.countDocuments({ 
      'generationDetails.type': 'free' 
    });
    const premiumNotes = await Note.countDocuments({ 
      'generationDetails.type': 'premium' 
    });

    // 5. Get notes by model distribution
    const modelDistribution = await Note.aggregate([
      {
        $group: {
          _id: '$generationDetails.model',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          model: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 6. Get notes by language distribution
    const languageDistribution = await Note.aggregate([
      {
        $group: {
          _id: '$generationDetails.language',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          language: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 7. Get revenue data from transactions
    const revenueLast24h = await Transaction.aggregate([
      {
        $match: {
          timestamp: { $gte: last24Hours },
          status: 'success'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    const revenueLast30d = await Transaction.aggregate([
      {
        $match: {
          timestamp: { $gte: last30Days },
          status: 'success'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    // 8. Get popular packages
    const popularPackages = await Transaction.aggregate([
      {
        $match: { status: 'success' }
      },
      {
        $group: {
          _id: '$packageName',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      },
      {
        $project: {
          packageName: '$_id',
          count: 1,
          totalRevenue: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 9. Get engagement metrics
    // Total views across all notes
    const totalViewsResult = await Note.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          avgViewsPerNote: { $avg: '$views' }
        }
      }
    ]);

    // Most viewed notes
    const mostViewedNotes = await Note.find({})
      .sort({ views: -1 })
      .limit(5)
      .select('title views likes owner createdAt')
      .populate('owner', 'name email');

    // 10. Get active users (users with activity in last 24h)
    const activeUsers = await User.countDocuments({
      $or: [
        { updatedAt: { $gte: last24Hours } },
        { 'notes.0': { $exists: true } }
      ]
    });

    // 11. Get flashcard sets data
    const totalFlashcardSets = await FlashcardSet.countDocuments();
    const flashcardSetsLast24h = await FlashcardSet.countDocuments({
      createdAt: { $gte: last24Hours }
    });

    // 12. Get quizzes data
    const totalQuizzes = await Quiz.countDocuments();
    const quizzesLast24h = await Quiz.countDocuments({
      createdAt: { $gte: last24Hours }
    });

    // 13. Get referral source distribution (you'll need to add this field to User schema)
    // For now, let's create mock data or leave empty
    const referralSources = [
      { source: 'WhatsApp Status', count: 2619, percentage: 45 },
      { source: 'LinkedIn Organic', count: 1746, percentage: 30 },
      { source: 'Direct / Search', count: 873, percentage: 15 },
      { source: 'Shadow Seeding', count: 582, percentage: 10 }
    ];

    // 14. Get system activity logs (recent activities)
    const recentNotes = await Note.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title owner createdAt status')
      .populate('owner', 'name username');

    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email username createdAt');

    const recentTransactions = await Transaction.find({ status: 'success' })
      .sort({ timestamp: -1 })
      .limit(5)
      .select('userName userEmail amount packageName timestamp');

    // Format activity logs
    const activityLogs = [
      // Add system-generated logs
      {
        user: 'System_Protocol',
        action: 'System Override',
        detail: 'Shadow Growth Protocol Activated',
        time: 'Now'
      }
    ];

    // Add recent user activities
    recentUsers.forEach(user => {
      const hoursAgo = Math.floor((now - user.createdAt) / (1000 * 60 * 60));
      const timeText = hoursAgo === 0 ? 'Now' : 
                      hoursAgo === 1 ? '1h ago' : 
                      `${hoursAgo}h ago`;
      
      activityLogs.push({
        user: user.username || user.name.split(' ')[0],
        action: 'Personnel Sync',
        detail: `New user registered: ${user.email}`,
        time: timeText
      });
    });

    // Add recent note creations
    recentNotes.forEach(note => {
      const hoursAgo = Math.floor((now - note.createdAt) / (1000 * 60 * 60));
      const timeText = hoursAgo === 0 ? 'Now' : 
                      hoursAgo === 1 ? '1h ago' : 
                      `${hoursAgo}h ago`;
      
      activityLogs.push({
        user: note.owner?.username || note.owner?.name?.split(' ')[0] || 'Unknown',
        action: 'Note Forge',
        detail: `${note.title.substring(0, 30)}...`,
        time: timeText
      });
    });

    // 15. Calculate engagement rate
    const totalNotesWithViews = await Note.countDocuments({ views: { $gt: 0 } });
    const engagementRate = totalNotes > 0 ? 
      Math.round((totalNotesWithViews / totalNotes) * 10000) / 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        // Global Stats
        globalStats: {
          totalUsers,
          totalNotes,
          totalFlashcardSets,
          totalQuizzes,
          activeUsers,
          engagementRate: `${engagementRate}%`
        },

        // Growth Metrics
        growthMetrics: {
          newUsersLast24h,
          newUsersLast7d,
          notesLast24h,
          flashcardSetsLast24h,
          quizzesLast24h,
          userGrowthTrend: userGrowthData
        },

        // Revenue Data
        revenue: {
          last24h: revenueLast24h[0] || { totalAmount: 0, transactionCount: 0 },
          last30d: revenueLast30d[0] || { totalAmount: 0, transactionCount: 0 },
          popularPackages
        },

        // Content Distribution
        contentDistribution: {
          notes: {
            total: totalNotes,
            public: publicNotes,
            private: privateNotes,
            unlisted: unlistedNotes,
            free: freeNotes,
            premium: premiumNotes
          },
          modelDistribution,
          languageDistribution
        },

        // Engagement Analytics
        engagement: {
          totalViews: totalViewsResult[0]?.totalViews || 0,
          totalLikes: totalViewsResult[0]?.totalLikes || 0,
          avgViewsPerNote: Math.round(totalViewsResult[0]?.avgViewsPerNote || 0),
          mostViewedNotes
        },

        // Referral Sources
        referralSources,

        // Activity Logs
        activityLogs,

        // Real-time System Info
        systemInfo: {
          timestamp: now.toISOString(),
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          activeConnections: mongoose.connections.length
        }
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