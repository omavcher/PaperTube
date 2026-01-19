// routes/quiz.js
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    message: "Too many quiz generation requests. Please try again later."
  }
});

// Public endpoints

// Protected endpoints with rate limiting
router.post('/generate', auth, generateLimiter, quizController.generateQuiz);
router.get('/user/all', auth, quizController.getUserQuizzes);
router.get('/get/:slug', quizController.getQuizBySlug);
router.delete('/:slug', auth, quizController.deleteQuiz);

module.exports = router;