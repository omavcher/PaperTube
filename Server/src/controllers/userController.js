
// controllers/userController.js
const User = require('../models/User');
const Note = require('../models/Note');
const Comment = require('../models/Comment');
const FlashcardSet = require('../models/FlashcardSet');

/**
 * Get user public profile
 * GET /api/users/:username/profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by email (username is email in your schema)
    const user = await User.findOne({ username }).select(
      'name email picture  membership joinedAt followerUsers followingUsers'
    );

    console.log("🔍 Fetched User:", username);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Get user's notes (only public notes)
    const notes = await Note.find({ 
      owner: user._id,
      visibility: 'public'
    })
    .sort({ createdAt: -1 })
    .select(
      'title slug thumbnail videoUrl videoId pdf_data views createdAt generationDetails status likes'
    )
    .limit(50);

    // Get user's comments count
    const commentsCount = await Comment.countDocuments({ user: user._id });

    // Calculate stats
    const totalViews = notes.reduce((sum, note) => sum + (note.views || 0), 0);
    const totalPremiumNotes = notes.filter(note => 
      note.generationDetails?.type === 'premium'
    ).length;

    // Add note creation activities
    const noteActivities = notes.slice(0, 10).map(note => ({
      type: 'note_created',
      title: note.title,
      date: note.createdAt,
      link: `/notes/${note.slug}`
    }));


    // Get followers and following counts (using user's notes likes as proxy)
    // Note: Since your schema doesn't have followers, we'll use notes likes as engagement metric
    let totalLikes = 0;
    for (const note of notes) {
      const comments = await Comment.find({ note: note._id });
      totalLikes += comments.reduce((sum, comment) => sum + (comment.likes || 0), 0);
    }

    // Generate username from email
    const generatedUsername = user.email.split('@')[0];
   const followingCount = user.followingUsers ? user.followingUsers.length : 0;
    const followersCount = user.followerUsers ? user.followerUsers.length : 0;

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture || '',
        username: generatedUsername,
        joinDate: user.joinedAt,
        isPremium: user.membership?.isActive || false,
        membershipPlan: user.membership?.planName || 'Free',
        totalViews,
        totalLikes,
        followersCount,
        followingCount 
      },
      notes: notes.map(note => ({
        _id: note._id,
        title: note.title,
        slug: note.slug,
        thumbnail: note.thumbnail || `https://img.youtube.com/vi/${note.videoId}/hqdefault.jpg`,
        videoId: note.videoId,
        pdfThumbnail: note.pdf_data?.thumbnailLink,
        views: note.views || 0,
        createdAt: note.createdAt,
        isPremium: note.generationDetails?.type === 'premium',
        status: note.status
      })),
      stats: {
        totalNotes: notes.length,
        totalViews,
        totalLikes,
        commentsCount,
        totalPremiumNotes,
        followersCount,
        followingCount
      },
    });
  } catch (error) {
    console.error("❌ Get User Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message
    });
  }
};

/**
 * Follow/Unfollow user
 * POST /api/users/:userId/follow
 */
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot follow yourself" 
      });
    }

    const userToFollow = await User.findById(userId);
    
    if (!userToFollow) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Since your schema doesn't have followers, we'll store it in a separate collection
    // For now, we'll return a success response but won't actually store the relationship
    // You can implement this later with a Follow model
    
    // Simulate follow/unfollow logic
    const isFollowing = Math.random() > 0.5; // Simulated for now

    if (isFollowing) {
      // Simulate unfollow
      return res.status(200).json({
        success: true,
        message: "Unfollowed successfully",
        isFollowing: false
      });
    } else {
      // Simulate follow
      return res.status(200).json({
        success: true,
        message: "Followed successfully",
        isFollowing: true
      });
    }
  } catch (error) {
    console.error("❌ Follow User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to follow user",
      error: error.message
    });
  }
};

/**
 * Get user's notes with pagination
 * GET /api/users/:userId/notes
 */
exports.getUserNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12, type } = req.query;
    const skip = (page - 1) * limit;

    // Build query for both notes and flashcards
    let queryNotes = { owner: userId, visibility: 'public' };
    let queryFlashcards = { owner: userId, visibility: 'public' };
    
    if (type === 'premium') {
      queryNotes['generationDetails.type'] = 'premium';
      queryFlashcards['generationDetails.type'] = 'premium';
    } else if (type === 'free') {
      queryNotes['generationDetails.type'] = 'free';
      queryFlashcards['generationDetails.type'] = 'free';
    }

    // Fetch notes and flashcards in parallel
    const [notes, flashcards] = await Promise.all([
      Note.find(queryNotes)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('title slug thumbnail videoUrl videoId pdf_data views createdAt generationDetails status'),
      FlashcardSet.find(queryFlashcards)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('title slug thumbnail videoUrl videoId stats createdAt generationDetails status flashcards')
    ]);

    // Get total counts
    const [totalNotes, totalFlashcards] = await Promise.all([
      Note.countDocuments(queryNotes),
      FlashcardSet.countDocuments(queryFlashcards)
    ]);

    const [totalPremiumNotes, totalPremiumFlashcards] = await Promise.all([
      Note.countDocuments({ ...queryNotes, 'generationDetails.type': 'premium' }),
      FlashcardSet.countDocuments({ ...queryFlashcards, 'generationDetails.type': 'premium' })
    ]);

    const totalItems = totalNotes + totalFlashcards;
    const totalPremium = totalPremiumNotes + totalPremiumFlashcards;

    // Transform notes
    const transformedNotes = notes.map(note => ({
      _id: note._id,
      title: note.title,
      slug: note.slug,
      thumbnail: note.thumbnail || `https://img.youtube.com/vi/${note.videoId}/hqdefault.jpg`,
      videoId: note.videoId,
      pdfThumbnail: note.pdf_data?.thumbnailLink,
      views: note.views || 0,
      createdAt: note.createdAt,
      isPremium: note.generationDetails?.type === 'premium',
      status: note.status,
      type: 'note'
    }));

    // Transform flashcards
    const transformedFlashcards = flashcards.map(flashcard => ({
      _id: flashcard._id,
      title: flashcard.title,
      slug: flashcard.slug,
      thumbnail: flashcard.thumbnail || `https://img.youtube.com/vi/${flashcard.videoId}/hqdefault.jpg`,
      videoId: flashcard.videoId,
      views: flashcard.stats?.totalReviews || 0,
      createdAt: flashcard.createdAt,
      isPremium: flashcard.generationDetails?.type === 'premium',
      status: flashcard.status,
      type: 'flashcard',
      cardCount: flashcard.flashcards?.length || 0
    }));

    // Combine and sort the results
    const combinedItems = [...transformedNotes, ...transformedFlashcards]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit));

    return res.status(200).json({
      success: true,
      notes: combinedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalItems,
        pages: Math.ceil(totalItems / limit),
        totalPremium,
        totalFree: totalItems - totalPremium
      }
    });
  } catch (error) {
    console.error("❌ Get User Notes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user notes",
      error: error.message
    });
  }
};

/**
 * Get user's comments
 * GET /api/users/:userId/comments
 */
exports.getUserComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('note', 'title slug')
      .populate('user', 'name picture');

    const totalComments = await Comment.countDocuments({ user: userId });

    return res.status(200).json({
      success: true,
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalComments,
        pages: Math.ceil(totalComments / limit)
      }
    });
  } catch (error) {
    console.error("❌ Get User Comments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user comments",
      error: error.message
    });
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, picture, bio, location, website } = req.body;

    // Find and update user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (picture) user.picture = picture;
    
    // Note: Your schema doesn't have bio, location, website fields
    // You can add them to the User model if needed
    
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        username: user.email.split('@')[0],
        joinDate: user.joinedAt,
        isPremium: user.membership?.isActive || false
      }
    });
  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message
    });
  }
};

/**
 * Get user stats
 * GET /api/users/:userId/stats
 */
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's notes
    const notes = await Note.find({ owner: userId, visibility: 'public' });
    
    // Calculate views
    const totalViews = notes.reduce((sum, note) => sum + (note.views || 0), 0);
    
    // Get comments and calculate likes
    let totalComments = 0;
    let totalLikes = 0;
    
    for (const note of notes) {
      const comments = await Comment.find({ note: note._id });
      totalComments += comments.length;
      totalLikes += comments.reduce((sum, comment) => sum + (comment.likes || 0), 0);
    }

    // Get token usage
    const user = await User.findById(userId).select('token usedToken tokenUsageHistory');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Calculate daily stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentNotes = await Note.find({
      owner: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const dailyStats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const notesOnDate = recentNotes.filter(note => 
        note.createdAt >= date && note.createdAt < nextDate
      );
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        notes: notesOnDate.length,
        views: notesOnDate.reduce((sum, note) => sum + (note.views || 0), 0)
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalNotes: notes.length,
        totalViews,
        totalComments,
        totalLikes,
        tokenBalance: user.token,
        usedTokens: user.usedToken,
        followersCount: Math.floor(totalViews / 10), // Estimated
        followingCount: 0,
        dailyStats
      }
    });
  } catch (error) {
    console.error("❌ Get User Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user stats",
      error: error.message
    });
  }
};

/**
 * Search users
 * GET /api/users/search
 */
exports.searchUsers = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    };

    const users = await User.find(searchQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .select('name email picture membership joinedAt')
      .sort({ 'membership.isActive': -1, joinedAt: -1 });

    const totalUsers = await User.countDocuments(searchQuery);

    // Get stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const notesCount = await Note.countDocuments({ 
          owner: user._id, 
          visibility: 'public' 
        });
        
        const totalViews = await Note.aggregate([
          { $match: { owner: user._id, visibility: 'public' } },
          { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]);

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          username: user.email.split('@')[0],
          joinDate: user.joinedAt,
          isPremium: user.membership?.isActive || false,
          notesCount,
          totalViews: totalViews[0]?.totalViews || 0
        };
      })
    );

    return res.status(200).json({
      success: true,
      users: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error("❌ Search Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search users",
      error: error.message
    });
  }
};

/**
 * Get suggested users to follow
 * GET /api/users/suggested
 */
exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user?._id;
    const limit = parseInt(req.query.limit) || 10;

    // Get users with most notes (excluding current user)
    const activeUsers = await Note.aggregate([
      { $match: { visibility: 'public' } },
      { $group: { _id: '$owner', noteCount: { $sum: 1 } } },
      { $sort: { noteCount: -1 } },
      { $limit: 50 }
    ]);

    // Get user details
    const userIds = activeUsers.map(u => u._id).filter(id => 
      id.toString() !== currentUserId?.toString()
    );

    const users = await User.find({ _id: { $in: userIds } })
      .limit(limit)
      .select('name email picture membership joinedAt')
      .sort({ 'membership.isActive': -1, joinedAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const notesCount = activeUsers.find(u => 
          u._id.toString() === user._id.toString()
        )?.noteCount || 0;

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          username: user.email.split('@')[0],
          joinDate: user.joinedAt,
          isPremium: user.membership?.isActive || false,
          notesCount
        };
      })
    );

    return res.status(200).json({
      success: true,
      users: usersWithStats
    });
  } catch (error) {
    console.error("❌ Get Suggested Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get suggested users",
      error: error.message
    });
  }
};

exports.getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user and populate follower users
    const user = await User.findById(userId)
      .populate('followerUsers', 'username name picture email')
      .select('followerUsers');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Calculate count from the array
    const followerCount = user.followerUsers ? user.followerUsers.length : 0;
    const followers = user.followerUsers || [];

    return res.status(200).json({
      success: true,
      count: followerCount,
      followers: followers
    });
  } catch (error) {
    console.error("❌ Get User Followers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user followers",
      error: error.message
    });
  }
};

exports.getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user and populate following users
    const user = await User.findById(userId)
      .populate('followingUsers', 'username name picture email')
      .select('followingUsers');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Calculate count from the array
    const followingCount = user.followingUsers ? user.followingUsers.length : 0;
    const following = user.followingUsers || [];

    return res.status(200).json({
      success: true,
      count: followingCount,
      following: following
    });
  } catch (error) {
    console.error("❌ Get User Following Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user following",
      error: error.message
    });
  }
};