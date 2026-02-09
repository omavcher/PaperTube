const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");
// Public routes
router.get('/:username/profile', userController.getUserProfile);
router.get('/:userId/notes', userController.getUserNotes);
router.get('/:userId/stats', userController.getUserStats);
router.get('/search', userController.searchUsers);
router.get('/:userId/followers', userController.getUserFollowers);
router.get('/:userId/following', userController.getUserFollowing);

// Protected routes (require authentication)
router.post('/:userId/follow', authMiddleware, userController.followUser);
router.get('/:userId/comments', authMiddleware, userController.getUserComments);
router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/suggested', authMiddleware, userController.getSuggestedUsers);

router.post('/update-streak', authMiddleware, userController.updateStreak);

router.post('/get-groble-leaderboard', userController.getGrobleLeaderboard);
module.exports = router;