const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 Google Login route
router.post("/google", authController.googleAuth);
router.get("/getToken", authMiddleware, authController.getToken);
router.delete("/delete-account", authMiddleware, authController.deleteAccount);

module.exports = router;