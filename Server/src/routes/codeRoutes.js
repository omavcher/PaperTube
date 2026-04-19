const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const codeController = require('../controllers/codeController');

router.post('/generate', auth, codeController.generateCodeSolution);
router.get('/:slug', auth, codeController.getCodeSolution);
router.post('/verify', codeController.verifyProblemUrl);

module.exports = router;
