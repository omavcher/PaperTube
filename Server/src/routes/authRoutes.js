const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 Google Login route
router.post("/google", authController.googleAuth);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/send-signup-otp", authController.sendSignupOtp);
router.post("/send-forgot-otp", authController.sendForgotOtp);
router.post("/reset-password-otp", authController.resetPasswordOtp);
router.post("/github", authController.githubAuth);
router.get("/getToken", authMiddleware, authController.getToken);
router.delete("/delete-account", authMiddleware, authController.deleteAccount);
router.put("/update-profile",authMiddleware, authController.updateProfile);
router.get("/get-profile",authMiddleware, authController.getProfile);
router.get("/plan-status", authMiddleware, authController.getPlanStatus);
router.get("/services", authMiddleware, authController.getUserServices);


module.exports = router;