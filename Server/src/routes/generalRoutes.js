const express = require("express");
const router = express.Router();
const generalController = require("../controllers/generalController");

router.post("/bugs/report", generalController.reportBug);
router.post("/feedback/submit", generalController.submitFeedback);

module.exports = router;