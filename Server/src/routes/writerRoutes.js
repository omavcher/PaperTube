const express = require("express");
const router = express.Router();
const writerController = require("../controllers/writerController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 POST /api/writer/detect
router.post("/detect", authMiddleware, writerController.detectAI);

// 🔹 POST /api/writer/plagiarism
router.post("/plagiarism", authMiddleware, writerController.checkPlagiarism);

// 🔹 POST /api/writer/plagiarism/pdf
router.post("/plagiarism/pdf", authMiddleware, writerController.downloadPlagiarismPdf);

// 🔹 POST /api/writer/humanize
router.post("/humanize", authMiddleware, writerController.humanizeAI);

// 🔹 POST /api/writer/essay
router.post("/essay", authMiddleware, writerController.generateEssay);

// 🔹 GET /api/writer/essay/:slug
router.get("/essay/:slug", authMiddleware, writerController.getEssayBySlug);

// 🔹 PUT /api/writer/essay/:slug
router.put("/essay/:slug", authMiddleware, writerController.updateEssay);

module.exports = router;
