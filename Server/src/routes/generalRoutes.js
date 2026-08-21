const express = require("express");
const router = express.Router();
const generalController = require("../controllers/generalController");

router.post("/bugs/report", generalController.reportBug);
router.post("/feedback/submit", generalController.submitFeedback);

router.post('/r2/presign', generalController.getPublicPresignedUrl);
// Matches your frontend call: api.post("/success-stories/share", payload)
router.post('/success-stories/share', generalController.shareStory);

// Route for listing stories
router.get('/story/all', generalController.getAllStories);
router.get('/story-slug/:slug', generalController.getStoryBySlug);

router.get('/blog/all', generalController.getAllPublicPosts);
router.get('/blog/:slug', generalController.getPostBySlug);

router.post('/track', generalController.trackMetric);

router.get('/ju', generalController.getJuData);

// ─── Pricing Region Detection ─────────────────────────────────────────────────
// GET /api/general/pricing-region
// Resolves the caller's country via their IP address (authoritative, server-side).
// India (IN) → show INR pricing & Razorpay checkout
// All others → show USD pricing & PayPal/LemonSqueezy checkout
//
// IP resolution priority:
//   1. CF-Connecting-IP  (Cloudflare)
//   2. X-Forwarded-For   (reverse proxies / Nginx)
//   3. req.socket.remoteAddress (direct connection)
//
// Country lookup: ipapi.co (free, 1,000 req/day) — no API key required.
// For production with higher traffic, swap to ip-api.com Pro or MaxMind GeoLite2.
router.get('/pricing-region', require("../controllers/pricingRegionController"));

module.exports = router;