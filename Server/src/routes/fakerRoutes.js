const express = require('express');
const router = express.Router();
const fakerController = require('../controllers/fakerController');
const adminAuth = require('../middleware/adminAuth');

// User Faker Endpoints
router.get('/users', adminAuth, fakerController.getFakeUsers);
router.post('/users/create', adminAuth, fakerController.createFakeUsers);
router.post('/users/create-detailed', adminAuth, fakerController.createDetailedUser);
router.post('/users/batch-generate', adminAuth, fakerController.batchGenerateUsers);
router.post('/users/allocate-subscription', adminAuth, fakerController.allocateSubscription);
router.post('/users/inject-transaction', adminAuth, fakerController.injectTransaction);
router.put('/users/stats', adminAuth, fakerController.updateUserStats);
router.post('/users/followers', adminAuth, fakerController.addFollowers);
router.delete('/users/purge', adminAuth, fakerController.purgeAllFakeUsers);
router.delete('/users/:id', adminAuth, fakerController.deleteFakeUser);

// Note & Prompt Endpoints
router.post('/inject', adminAuth, fakerController.injectNote);
router.post('/prompt', adminAuth, fakerController.getPrompt);
router.get('/notes/search', adminAuth, fakerController.searchNotes);

module.exports = router;
