const express = require('express');
const router = express.Router();
const fakerController = require('../controllers/fakerController');
const adminAuth = require('../middleware/adminAuth');

router.get('/users', adminAuth, fakerController.getFakeUsers);
router.post('/users/create', adminAuth, fakerController.createFakeUsers);
router.put('/users/stats', adminAuth, fakerController.updateUserStats);
router.post('/users/followers', adminAuth, fakerController.addFollowers);
router.post('/inject', adminAuth, fakerController.injectNote);
router.post('/comments/bulk', adminAuth, fakerController.bulkComments);
router.post('/prompt', adminAuth, fakerController.getPrompt);
router.get('/notes/search', adminAuth, fakerController.searchNotes);

module.exports = router;
