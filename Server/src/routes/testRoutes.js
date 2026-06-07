const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createPracticeTest, getPracticeTestBySlug, exportPracticeTestPDF, deletePracticeTest } = require('../controllers/testController');

router.post('/generate', authMiddleware, createPracticeTest);
router.get('/:slug', authMiddleware, getPracticeTestBySlug);
router.get('/:slug/export', authMiddleware, exportPracticeTestPDF);
router.delete('/:id', authMiddleware, deletePracticeTest);

module.exports = router;
