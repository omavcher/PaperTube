const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agentController");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Optional auth helper to attach req.user if JWT is present
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Auth") || req.header("Authorization");
    if (authHeader) {
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
      if (token && token !== "null" && token !== "undefined") {
        const decoded = jwt.verify(token, process.env.SESSION_SECRET);
        if (decoded && decoded.id) {
          req.user = await User.findById(decoded.id).select("-__v");
        }
      }
    }
  } catch (e) {
    // Ignore invalid/expired tokens for optional routes
  }
  next();
};

// Setup Multer memory storage for audio blob uploads (up to 25MB)
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

// POST /api/agent/chat - Autonomous Agent reasoning stream
router.post("/chat", optionalAuth, agentController.handleAgentQuery);

// POST /api/agent/transcribe - High-speed voice audio transcription & prompt polish
router.post("/transcribe", optionalAuth, upload.single("audio"), agentController.transcribeVoice);

// Image Generation Endpoints (Qwen Image 3 & LLM Prompt Enhancer)
router.post("/image/generate", optionalAuth, agentController.generateImage);
router.post("/image/enhance-prompt", optionalAuth, agentController.enhancePrompt);

// Composio Integrations Endpoints
router.get("/integrations", optionalAuth, agentController.getIntegrations);
router.get("/integrations/:slug/tools", optionalAuth, agentController.getConnectorTools);
router.post("/integrations/connect", optionalAuth, agentController.connectIntegration);
router.delete("/integrations/:accountId", optionalAuth, agentController.disconnectIntegration);
router.post("/integrations/execute", optionalAuth, agentController.executeIntegrationAction);

// Agent Session History Endpoints
router.get("/sessions", optionalAuth, agentController.getUserSessions);
router.delete("/sessions/:slug", optionalAuth, agentController.deleteUserSession);

module.exports = router;
