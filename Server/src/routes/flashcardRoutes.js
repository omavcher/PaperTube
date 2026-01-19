// routes/flashcardRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const flashcardController = require('../controllers/flashcardController');

router.post('/free', auth, flashcardController.generateFreeFlashcards);
router.get('/get-all-sets', auth, flashcardController.getUserFlashcardSets);
router.get('/set/:slug', auth, flashcardController.getFlashcardSetBySlug);

module.exports = router;