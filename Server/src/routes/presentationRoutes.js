const express = require("express");
const router = express.Router();
const presentationController = require("../controllers/presentationController");
const authMiddleware = require("../middleware/authMiddleware");
const { enforceQuota } = require("../middleware/quotaMiddleware");

// All presentation routes require authentication
router.use(authMiddleware);

// Generation & AI Co-pilot endpoints
router.post("/generate-outline", presentationController.generateOutline);
router.post("/generate-final", enforceQuota("presentations"), presentationController.generateFinal);
router.post("/enhance-slide", presentationController.enhanceSlide);

// Library & workspace management endpoints
router.get("/get-all", presentationController.getUserPresentations);
router.put("/move", presentationController.movePresentationToFolder);
router.put("/update/:id", presentationController.updatePresentation);
router.delete("/:id", presentationController.deletePresentation);

// Retrieve presentation details by slug
router.get("/:slug", presentationController.getPresentationBySlug);

// File export endpoints
router.get("/:slug/export/pptx", presentationController.exportPPTX);
router.get("/:slug/export/pdf", presentationController.exportPDF);

module.exports = router;
