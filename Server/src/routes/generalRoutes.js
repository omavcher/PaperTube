const express = require("express");
const router = express.Router();
const generalController = require("../controllers/generalController");

router.post("/bugs/report", generalController.reportBug);
router.post("/feedback/submit", generalController.submitFeedback);
router.post('/game-stats', generalController.postGameStats);
// Matches your frontend call: api.post("/success-stories/share", payload)
router.post('/success-stories/share', generalController.shareStory);

// Route for listing stories
router.get('/story/all', generalController.getAllStories);
router.get('/story-slug/:slug', generalController.getStoryBySlug);

router.get('/blog/all', generalController.getAllPublicPosts);
router.get('/blog/:slug', generalController.getPostBySlug);

router.post('/track', generalController.trackMetric);

router.get('/ju', generalController.getJuData);
module.exports = router;