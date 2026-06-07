const express = require("express");
const router = express.Router();
const diagramController = require("../controllers/diagramController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 Generate new AI diagram (authenticating user first)
router.post("/generate", authMiddleware, diagramController.generateDiagram);

// 🔹 Retrieve logged-in user's diagram generation history
router.get("/history", authMiddleware, diagramController.getUserDiagramHistory);

// 🔹 Get details of a single diagram by its slug (public, allowing sharing)
router.get("/item/:slug", diagramController.getDiagramBySlug);

// 🔹 Delete a diagram by ID
router.delete("/:id", authMiddleware, diagramController.deleteDiagram);

module.exports = router;
