const express = require("express");
const router = express.Router();
const presentationController = require("../controllers/presentationController");
const authMiddleware = require("../middleware/authMiddleware");
const { enforceQuota } = require("../middleware/quotaMiddleware");

// Public endpoints (view presentation by slug, export)
router.get("/:slug", presentationController.getPresentationBySlug);
router.get("/:slug/export/pptx", presentationController.exportPPTX);
router.get("/:slug/export/pdf", presentationController.exportPDF);

// Authenticated endpoints
router.use(authMiddleware);

// Generation & Creation endpoints
router.post("/create-blank", presentationController.createBlankPresentation);
router.post("/generate-outline", presentationController.generateOutline);
router.post("/generate-final", enforceQuota("presentations"), presentationController.generateFinal);
router.post("/image-candidates", presentationController.getImageCandidates);

// AI Co-Pilot & Conversational Agent Tool Router
router.post("/agent-action", presentationController.agentAction);
router.post("/enhance-slide", presentationController.enhanceSlide);

// Library & workspace management endpoints
router.get("/get-all", presentationController.getUserPresentations);
router.put("/move", presentationController.movePresentationToFolder);
router.put("/update/:id", presentationController.updatePresentation);
router.delete("/:id", presentationController.deletePresentation);

module.exports = router;
