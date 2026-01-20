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


module.exports = router;