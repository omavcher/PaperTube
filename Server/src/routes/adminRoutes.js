// routes/flashcardRoutes.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

router.get('/diagnostics', adminAuth, adminController.getDiagnostics);
router.get('/users', adminAuth, adminController.getAllUsers);
router.delete('/user/:id', adminAuth, adminController.deleteUser);
router.get('/transactions', adminAuth, adminController.getAllTransactions);
router.get('/bugs', adminAuth, adminController.getAllBugs);
router.get('/creations', adminAuth, adminController.getRecentCreations);

router.get('/feedback', adminAuth, adminController.getAllFeedback);
router.delete('/feedback/:id', adminAuth, adminController.deleteFeedback);
router.patch('/feedback/:id', adminAuth, adminController.respondToFeedback);

router.get('/analytics/logs', adminAuth, adminController.getAnalytics);
router.get('/arcade-diagnostics', adminAuth, adminController.getArcadeDiagnostics);
module.exports = router;