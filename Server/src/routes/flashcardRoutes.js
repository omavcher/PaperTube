const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const flashcardController = require('../controllers/flashcardController');

// Generate a new flashcard set (free or premium model)
router.post('/generate', authMiddleware, flashcardController.createFlashcardSet);

// Get a flashcard set by slug
router.get('/slug/:slug', authMiddleware, flashcardController.getFlashcardSetBySlug);

// Get all flashcard sets for the logged-in user
router.get('/my-sets', authMiddleware, flashcardController.getUserFlashcardSets);

// Delete a flashcard set
router.delete('/:id', authMiddleware, flashcardController.deleteFlashcardSet);

module.exports = router;
