const express = require("express");
const chatController = require("../controllers/chatController");
const router = express.Router();

router.get("/getMessages/:noteId", chatController.getMessages);
router.post("/message", chatController.handleMessage);
router.post("/feedback", chatController.handleFeedback);

module.exports = router;