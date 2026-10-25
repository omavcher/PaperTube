const express = require("express");
const router = express.Router();
const narrationController = require("../controllers/narrationController");

// POST /api/narration/generate - Generate synchronized narration audio using Sarvam Bulbul V3
router.post("/generate", narrationController.generateNarration);

// POST /api/narration/visual-plan - Generate Schema 2.0 Visual Plan via Gemini 3.8 Flash
router.post("/visual-plan", narrationController.generateVisualPlan);

// POST /api/narration/explain-image - Full pipeline: Image + Prompt -> Gemini 3.8 Flash -> Sarvam Bulbul V3
router.post("/explain-image", narrationController.explainImage);

// GET /api/narration/voices - Get supported Indic/English languages and voice catalog
router.get("/voices", narrationController.getVoices);

// GET /api/narration/:jobId - Poll status of an async narration job
router.get("/:jobId", narrationController.getJobStatus);

module.exports = router;
