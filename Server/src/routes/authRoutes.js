const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 Google Login route
router.post("/google", authController.googleAuth);
router.get("/getToken", authMiddleware, authController.getToken);
router.delete("/delete-account", authMiddleware, authController.deleteAccount);
router.put("/update-profile",authMiddleware, authController.updateProfile);
router.get("/get-profile",authMiddleware, authController.getProfile);
router.get("/plan-status", authMiddleware, authController.getPlanStatus);
router.get("/services", authMiddleware, authController.getUserServices);


module.exports = router;