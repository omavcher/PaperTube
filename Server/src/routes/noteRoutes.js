const express = require("express");
const noteController = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  requireSubscriptionOrTokens,
} = require("../middleware/accessControl");
const freeNoteController = require('../controllers/freeNoteController.js');
const premiumNoteController = require('../controllers/premiumNoteController');


const router = express.Router();

const NOTE_GENERATION_TOKEN_COST = 25;


// Free model routes (token-based)
router.post('/free', 
  // requireSubscriptionOrTokens({ 
  //   tokenCost: NOTE_GENERATION_TOKEN_COST, 
  //   actionLabel: "generate notes with free models" 
  // }), 
  authMiddleware,
  freeNoteController.createNote
);

// Premium model routes (subscription-based)
router.post('/premium', 
  // requireActiveSubscription("Premium subscription required for premium models"),
  authMiddleware,
  premiumNoteController.createNote
);






router.get("/", noteController.getNotes);
router.post("/ytinfo", noteController.getYouTubeInfo);
router.get("/slug/:slug",authMiddleware, noteController.getNoteBySlug);

router.get("/allw/:slug",noteController.getNoteALLBySlug);


router.put("/update/:id",authMiddleware, noteController.updateNote);

router.get("/get-all-notes",authMiddleware, noteController.getUserNotes);


router.get("/genrate/pdf" , noteController.generatePDF);

router.get("/explore" , noteController.explore);

router.get("/:noteId/comments", noteController.getComments);


router.post("/:noteId/comments", noteController.createComment);


router.post("/comments/:commentId/like", noteController.likeComment);


router.post("/comments/:commentId/replies", noteController.createReply);

router.post("/comments/:commentId/replies/:replyId/like", noteController.likeReply);


router.get("/analytics", authMiddleware, noteController.getUserAnalytics);

// Note management routes
router.get("/my-notes", authMiddleware, noteController.getUserNotes);
router.delete("/:id", authMiddleware, noteController.deleteNote);
router.post("/bulk-delete", authMiddleware, noteController.bulkDeleteNotes);
router.patch("/:id/visibility", authMiddleware, noteController.updateNoteVisibility);
router.get("/:id/edit", authMiddleware, noteController.getNoteForEdit);
// Add this route
router.get("/:id/analytics", authMiddleware, noteController.getNoteAnalytics);
router.patch("/:id", authMiddleware, noteController.updateNoteedit);
module.exports = router;