const Bug = require("../models/Bug");
const Note = require("../models/Note");
const User = require("../models/User");

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
