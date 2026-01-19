// routes/flashcardRoutes.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

router.get('/diagnostics', adminAuth, adminController.getDiagnostics);

module.exports = router;