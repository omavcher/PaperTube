const Bug = require("../models/Bug");
const Note = require("../models/Note");
const User = require("../models/User");
const GameStats = require("../models/GameStats");
const SuccessStory = require('../models/SuccessStory');
const BlogPost = require('../models/BlogPost');
const Quiz = require('../models/Quiz');
const FlashcardSet = require('../models/FlashcardSet');

exports.reportBug = async (req, res) => {
  try {
    const { title, description, severity, evidenceUrl, metadata, userId } = req.body;

    const bug = await Bug.create({
      title,
      description,
      severity,
      evidenceUrl,
      userId: userId || 'guest',
      metadata: {
        ...metadata,
        ip: req.ip || req.headers['x-forwarded-for']
      }
    });

    res.status(201).json({ success: true, message: "Bug logged in Master Registry", bug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
  try {
    const { quote, name, email, rating, location, profilePicture, userId } = req.body;

    const feedback = await Feedback.create({
      userId: userId || 'guest',
      name,
      email,
      rating,
      quote,
      location,
      profilePicture
    });

    res.status(201).json({ 
      success: true, 
      message: "Feedback received by the Lab.", 
      feedback 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.leaderboard = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } 
}





exports.postGameStats = async (req, res) => {
  try {
    const {userId , name, email, game, stats , device} = req.body;
    const newGameStats = new GameStats({
      userId,
      name,
      email,
      game,
      stats,
      device
    });

    if(userId != 'guest_node') {
    const userx = await User.findById(userId);
    if (userx) {
      userx.totalGamesPlayed = (userx.totalGamesPlayed || 0) + 1;
      userx.xp = (userx.xp || 0) + Math.floor(stats.score / 10); // Example: 1 XP per 10 points
      // Update rank based on XP thresholds
      if (userx.xp >= 1000) { 
        userx.rank = "legendary";
      } else if (userx.xp >= 500) {
        userx.rank = "master";
      } else {
        userx.rank = "basic";
      }
      await userx.save();
    }
  }

    await newGameStats.save();

    res.status(201).json({
      success: true,
      message: "Game stats recorded successfully."
    });
    }
  catch (error) {
    console.error("❌ Post Game Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while recording game stats.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




exports.shareStory = async (req, res) => {
  try {
    const { 
      name, handle, avatar, exam, rank, 
      heroTitle, summary, fullJourney, date 
    } = req.body;

    if (!name || !exam || !fullJourney) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields in uplink protocol."
      });
    }

    const MAX_SLUG_LENGTH = 60;

    const makeSlug = (text) =>
      text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

    const slugBase = `${name} ${heroTitle}`;
    let slug = makeSlug(slugBase);

    // word-safe max length
    if (slug.length > MAX_SLUG_LENGTH) {
      slug = slug.slice(0, MAX_SLUG_LENGTH);
      slug = slug.slice(0, slug.lastIndexOf("-"));
    }

    // final cleanup
    slug = slug.replace(/-+$/g, "");

    // 🔒 ensure uniqueness
    const existing = await SuccessStory.countDocuments({ slug });
    if (existing > 0) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const newStory = new SuccessStory({
      slug,
      name,
      handle,
      avatar,
      exam,
      rank,
      heroTitle,
      summary,
      fullJourney,
      date
    });

    await newStory.save();

    res.status(201).json({
      success: true,
      message: "Success story successfully synced to Neural Node.",
      data: newStory
    });

  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: Data sync interrupted."
    });
  }
};


// Get all stories for the /success-stories page
exports.getAllStories = async (req, res) => {
  try {
    const stories = await SuccessStory.find({ isApproved: true }).sort({ createdAt: -1 }).select('_id name avatar exam rank heroTitle slug');
    // make the slug using name & heroTitle
    const storiesWithSlug = stories.map(story => {
      const slug = `${story.name.toLowerCase().replace(/ /g, '-')}-${story.heroTitle.toLowerCase().replace(/ /g, '-')}`;
      return { ...story._doc, slug };
    });

    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch stories." });
  }
};

// Get a single story by ID
exports.getStoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const story = await SuccessStory.findOne({ slug, isApproved: true });

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found." });
    }
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch the story." });
  }
};



// @route GET /api/general/blog/all
exports.getAllPublicPosts = async (req, res) => {
  try {
    // Only return fields needed for the listing card (exclude heavy 'content')
    const posts = await BlogPost.find({ isPublished: true })
      .select('title subtitle slug coverImage meta tags createdAt') 
      .sort({ createdAt: -1 });

    // Format date nicely for frontend if needed, or send raw
    const formattedPosts = posts.map(post => ({
      ...post._doc,
      date: new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

    res.status(200).json({ success: true, data: formattedPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Public fetch failed." });
  }
};

// @route GET /api/general/blog/:slug
exports.getPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true });

    if (!post) {
      return res.status(404).json({ success: false, message: "Article node not found." });
    }

    // Format date for the detail page
    const responseData = {
      ...post._doc,
      meta: {
        ...post.meta,
        date: new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
    };

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Detail fetch failed." });
  }
};



exports.trackMetric = async (req, res) => {
  try {
    const { type, id, metric } = req.body;
    
    console.log(`Tracking Request: Type=${type}, ID=${id}, Metric=${metric}`); // Debug Log

    const Model = type === 'story' ? SuccessStory : BlogPost;
    const query = { slug: id };
    
    let update = {};
    
    // Logic for Blog
    if (type === 'blog') {
      if (metric === 'view') update = { $inc: { 'meta.views': 1 } };
      else if (metric === 'share') update = { $inc: { 'meta.shares': 1 } };
    } 
    // Logic for Story
    else if (type === 'story') {
      if (metric === 'view') update = { $inc: { views: 1 } };
      else if (metric === 'share') update = { $inc: { shares: 1 } };
    }

    console.log("Update Query:", JSON.stringify(update)); // Debug Log

    // Execute Update
    const updatedDoc = await Model.findOneAndUpdate(query, update, { new: true });

    // CRITICAL FIX: Check if a document was actually found and updated
    if (!updatedDoc) {
      console.error(`❌ NO DOCUMENT FOUND for slug: ${id}`);
      return res.status(404).json({ success: false, message: "ID/Slug not found in database" });
    }

    console.log(`✅ Updated ${type}:`, updatedDoc.views || updatedDoc.meta?.views);
    res.status(200).json({ success: true, views: updatedDoc.views || updatedDoc.meta?.views });

  } catch (error) {
    console.error("Tracking Failed:", error);
    res.status(500).json({ success: false });
  }
};



exports.getJuData = async (req, res) => {
  try {
    const data = await FlashcardSet.find({}).limit(1).select('-transcript');
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve data." });
  }
};