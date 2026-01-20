const Bug = require("../models/Bug");
const Note = require("../models/Note");
const User = require("../models/User");
const GameStats = require("../models/GameStats");

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
        userx.rank = "Expert";
      } else if (userx.xp >= 500) {
        userx.rank = "Intermediate";
      } else {
        userx.rank = "Novice";
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
