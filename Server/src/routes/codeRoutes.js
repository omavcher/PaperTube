const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { enforceQuota } = require('../middleware/quotaMiddleware');
const codeController = require('../controllers/codeController');

router.post('/generate', auth, enforceQuota('code_solver'), codeController.generateCodeSolution);
router.get('/:slug', auth, codeController.getCodeSolution);
router.post('/verify', codeController.verifyProblemUrl);

module.exports = router;
