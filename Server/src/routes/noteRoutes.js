const express = require("express");
const noteController = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", noteController.getNotes);
router.post("/",authMiddleware, noteController.createNote);
router.post("/ytinfo", noteController.getYouTubeInfo);
router.get("/slug/:slug",authMiddleware, noteController.getNoteBySlug);
router.put("/update/:id",authMiddleware, noteController.updateNote);

router.get("/get-all-notes",authMiddleware, noteController.getUserNotes)



module.exports = router;