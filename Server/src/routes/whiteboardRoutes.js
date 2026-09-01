const express = require("express");
const router = express.Router();
const whiteboardController = require("../controllers/whiteboardController");
const authMiddleware = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Optional Auth Middleware (attaches user if valid token present, doesn't block guests)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Auth") || req.header("Authorization");
    if (authHeader) {
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
      if (token && token !== "null" && token !== "undefined") {
        const decoded = jwt.verify(token, process.env.SESSION_SECRET);
        const user = await User.findById(decoded.id).select("-__v");
        if (user) {
          req.user = user;
        }
      }
    }
  } catch (err) {
    // Ignore invalid token for optional routes
  }
  next();
};

// 🔹 Save or update whiteboard (auto-save endpoint)
router.post("/save", optionalAuth, whiteboardController.saveWhiteboard);

// 🔹 Get logged-in user's whiteboards list
router.get("/user", authMiddleware, whiteboardController.getUserWhiteboards);

// 🔹 AI Agent diagram generation
router.post("/ai-generate", optionalAuth, whiteboardController.generateWhiteboardAI);

// 🔹 Duplicate a whiteboard
router.post("/duplicate/:id", optionalAuth, whiteboardController.duplicateWhiteboard);

// 🔹 Delete whiteboard
router.delete("/:id", authMiddleware, whiteboardController.deleteWhiteboard);

// 🔹 Get whiteboard by slug/id (public/shared)
router.get("/:slug", optionalAuth, whiteboardController.getWhiteboard);

module.exports = router;
