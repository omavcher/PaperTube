const express = require("express");
const noteController = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  requireSubscriptionOrTokens,
} = require("../middleware/accessControl");
const { enforceQuota } = require("../middleware/quotaMiddleware");
const freeNoteController = require('../controllers/freeNoteController.js');
const premiumNoteController = require('../controllers/premiumNoteController');

const router = express.Router();

// Free model routes (plan quota checked: 3/day free, 120/mo Pro, 350/mo Power)
router.post('/free',
  authMiddleware,
  enforceQuota("notes"),
  freeNoteController.createNote
);

// Premium model routes (requires active Pro or Power membership)
router.post('/premium',
  authMiddleware,
  enforceQuota("notes"),
  premiumNoteController.createNote
);

// Job Status & Progress Tracking
router.get('/job/:jobId/status', authMiddleware, freeNoteController.getJobStatus);
router.post('/job/:jobId/cancel', authMiddleware, freeNoteController.cancelJob);






router.get("/", noteController.getNotes);
router.post("/ytinfo", noteController.getYouTubeInfo);
router.get("/slug/:slug", authMiddleware, noteController.getNoteBySlug);




router.put("/update/:id", authMiddleware, noteController.updateNote);

router.get("/get-all-notes", authMiddleware, noteController.getUserNotes);


router.get("/generate/pdf", noteController.generatePDF);
router.post("/generate/pdf-from-content", noteController.generatePDFFromContent);
router.delete('/delete/:noteId', noteController.deletePDF);
router.get('/list', noteController.getUserPDFs);

router.post("/like/:noteId", authMiddleware, noteController.likeNote);




router.get("/analytics", authMiddleware, noteController.getUserAnalytics);

// Note management routes
router.get("/my-notes", authMiddleware, noteController.getUserNotes);
router.delete("/:id", authMiddleware, noteController.deleteNote);
router.post("/bulk-delete", authMiddleware, noteController.bulkDeleteNotes);
router.patch("/:id/visibility", authMiddleware, noteController.updateNoteVisibility);
router.get("/:id/edit", authMiddleware, noteController.getNoteForEdit);
router.get("/:id/analytics", authMiddleware, noteController.getNoteAnalytics);
router.patch("/:id", authMiddleware, noteController.updateNoteedit);

// Folder management routes
router.post("/folders", authMiddleware, noteController.createFolder);
router.get("/folders", authMiddleware, noteController.getFolders);
router.put("/folders/:folderId", authMiddleware, noteController.renameFolder);
router.delete("/folders/:folderId", authMiddleware, noteController.deleteFolder);
router.put("/notes/move", authMiddleware, noteController.moveNoteToFolder);

module.exports = router;