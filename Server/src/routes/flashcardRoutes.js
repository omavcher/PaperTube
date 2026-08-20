const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const flashcardController = require('../controllers/flashcardController');
const { enforceQuota } = require('../middleware/quotaMiddleware');

// Generate a new flashcard set (free or premium model)
router.post('/generate', authMiddleware, enforceQuota('flashcards'), flashcardController.createFlashcardSet);

// Get a flashcard set by slug
router.get('/slug/:slug', authMiddleware, flashcardController.getFlashcardSetBySlug);

// Get all flashcard sets for the logged-in user
router.get('/my-sets', authMiddleware, flashcardController.getUserFlashcardSets);

// Update flashcard set (cards, titles, mastery, stats)
router.put('/update/:id', authMiddleware, flashcardController.updateFlashcardSet);

// AI Card Co-pilot enhancement
router.post('/enhance-card', authMiddleware, flashcardController.enhanceCard);

// Delete a flashcard set
router.delete('/:id', authMiddleware, flashcardController.deleteFlashcardSet);

module.exports = router;
