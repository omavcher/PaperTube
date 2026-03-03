// routes/promoRoutes.js
const express = require("express");
const router = express.Router();
const promoController = require("../controllers/promoController");
const authMiddleware = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuth");

// ── PUBLIC ──────────────────────────────────────────────────
// Get all currently visible, active promo codes
router.get("/active", promoController.getActivePromoCodes);

// ── AUTHENTICATED ────────────────────────────────────────────
// Verify a promo code before applying it (checks eligibility + calculates discount)
router.post("/verify", authMiddleware, promoController.verifyPromoCode);

// ── ADMIN ────────────────────────────────────────────────────
router.get("/admin/all", adminAuth, promoController.adminGetAllPromoCodes);
router.post("/admin/create", adminAuth, promoController.adminCreatePromoCode);
router.put("/admin/update/:id", adminAuth, promoController.adminUpdatePromoCode);
router.patch("/admin/toggle/:id", adminAuth, promoController.adminTogglePromoCode);
router.delete("/admin/delete/:id", adminAuth, promoController.adminDeletePromoCode);
router.get("/admin/usage/:id", adminAuth, promoController.adminGetPromoUsage);

module.exports = router;
