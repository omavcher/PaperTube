const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.post("/track", analyticsController.trackUserActivity);

module.exports = router;