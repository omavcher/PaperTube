const { ToolRecord } = require("../models/ToolRecord");

// 🔹 Save a new tool record (Artifact, Git Flow, or Certificate)
exports.saveRecord = async (req, res) => {
  try {
    // Destructuring userId from the root of req.body
    const { toolSlug, payload, metadata, userId } = req.body;

    if (!toolSlug || !payload) {
      return res.status(400).json({ 
        success: false, 
        message: "Tool type (slug) and data (payload) are required." 
      });
    }

    // Creating the record in your single "ToolRecord" collection
    const newRecord = await ToolRecord.create({
      toolSlug,
      payload,
      userId: userId || 'guest', // Fallback to guest if not logged in
      metadata: {
        ...metadata,
        ip: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent']
      }
    });

    return res.status(201).json({
      success: true,
      message: "Record saved successfully",
      data: {
        newRecord,
        id: newRecord._id,
        slug: newRecord.toolSlug,
        timestamp: newRecord.createdAt
      }
    });
  } catch (error) {
    console.error("❌ Save Tool Record Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error",
      error: error.message 
    });
  }
};
// 🔹 Get history for a specific tool (e.g., all "git-forge" records for this user)
exports.getToolHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { toolSlug } = req.params;

    const query = { userId };
    if (toolSlug) query.toolSlug = toolSlug;

    const history = await ToolRecord.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};