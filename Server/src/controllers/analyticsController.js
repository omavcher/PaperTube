const Analytics = require("../models/Analytics");
const ToolAnalytics = require("../models/ToolAnalytics");

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




exports.trackEvent = async (req, res) => {
  try {
    const { toolId, toolName, category, eventType, source } = req.body;
    
    // Get user ID if authenticated (assuming middleware populates req.user)
    const userId = req.user ? req.user._id : null;
    
    // specific logic to determine device (simplified)
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /mobile/i.test(userAgent);

    await ToolAnalytics.create({
      toolId,
      toolName,
      category,
      userId,
      eventType,
      source: source || 'dashboard',
      device: isMobile ? 'mobile' : 'desktop'
    });

    // Send 200 OK immediately (don't block the UI)
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Tracking Error:", error);
    // Even if tracking fails, don't break the app flow
    res.status(200).json({ success: false }); 
  }
};