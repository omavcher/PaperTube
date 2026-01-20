const Analytics = require("../models/Analytics");

// Controller to track user activity
exports.trackUserActivity = async (req, res) => {
  try {
    const { userId, email, isLoggedIn, source, path, userAgent } = req.body;
    const analyticsEntry = new Analytics({
      userId,
      email,
        isLoggedIn,
        source,
        path,
        userAgent,
    });
    await analyticsEntry.save();
    res.status(201).json({ message: "User activity tracked successfully." });
  } catch (error) {
    console.error("Error tracking user activity:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};