const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createPracticeTest, getPracticeTestBySlug } = require('../controllers/testController');

router.post('/generate', authMiddleware, createPracticeTest);
router.get('/:slug', authMiddleware, getPracticeTestBySlug);

module.exports = router;
