const express = require("express");
const router = express.Router();
const toolController = require("../controllers/toolController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 Save usage for any tool (Artifact, Git, Internship)
// POST /api/tools/save
router.post("/save", toolController.saveRecord);

// 🔹 Get all history for the logged-in user
// GET /api/tools/history
router.get("/history", authMiddleware, toolController.getToolHistory);

// 🔹 Get history filtered by specific tool
// GET /api/tools/history/git-forge
router.get("/history/:toolSlug", authMiddleware, toolController.getToolHistory);

module.exports = router;