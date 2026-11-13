// controllers/promoController.js — Unified Promo & Coupon Controller
const { Coupon, CouponRedemption, evaluateCoupon, recordRedemption } = require("../coupon");
const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────
//  PUBLIC: Get visible active promo codes
// ─────────────────────────────────────────────────────────────
exports.getActivePromoCodes = async (req, res) => {
  try {
    const now = new Date();

    const codes = await Coupon.find(
      {
        $or: [{ active: true }, { isActive: true }],
        $expr: {
          $or: [
            { $eq: ["$maxRedemptions", null] },
            { $lt: ["$redeemedCount", "$maxRedemptions"] },
            { $lt: ["$usedCount", "$maxUsageLimit"] },
          ],
        },
        $and: [
          {
            $or: [
              { validUntil: null },
              { validTo: null },
              { validUntil: { $gte: now } },
              { validTo: { $gte: now } },
            ],
          },
          { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
        ],
      },
      {
        code: 1,
        name: 1,
        description: 1,
        type: 1,
        discountType: 1,
        percent: 1,
        discountValue: 1,
        flat: 1,
        applicableTo: 1,
        plans: 1,
        restrictedToPlans: 1,
        maxUsageLimit: 1,
        maxRedemptions: 1,
        usedCount: 1,
        redeemedCount: 1,
        maxDiscountCap: 1,
        minOrderAmount: 1,
        validUntil: 1,
        validTo: 1,
      }
    ).lean();

    const publicCodes = codes.map((c) => {
      const maxLimit = c.maxRedemptions != null ? c.maxRedemptions : c.maxUsageLimit || 100;
      const currentUsed = c.redeemedCount != null ? c.redeemedCount : c.usedCount || 0;
      return {
        code: c.code,
        name: c.name || c.code,
        description: c.description || "",
        discountType: c.type || c.discountType || "percent",
        discountValue: c.percent != null ? c.percent : c.discountValue || 0,
        applicableTo: c.applicableTo || "all",
        restrictedToPlans: c.plans && c.plans.length ? c.plans : c.restrictedToPlans || [],
        maxDiscountCap: c.maxDiscountCap || 0,
        minOrderAmount: c.minOrderAmount || 0,
        slotsRemaining: Math.max(0, maxLimit - currentUsed),
        validUntil: c.validTo || c.validUntil,
        isAlmostGone: maxLimit - currentUsed <= Math.ceil(maxLimit * 0.2),
      };
    });

    res.json({ success: true, promoCodes: publicCodes });
  } catch (error) {
    console.error("❌ Error fetching promo codes:", error);
    res.status(500).json({ success: false, message: "Failed to fetch promo codes" });
  }
};

// ─────────────────────────────────────────────────────────────
//  PUBLIC (Auth Required): Verify a promo code for a given order
// ─────────────────────────────────────────────────────────────
exports.verifyPromoCode = async (req, res) => {
  try {
    const { code, packageId, packageType = "subscription", baseAmount, billingPeriod = "monthly", currency = "INR" } = req.body;
    const userId = req.user?._id;

    if (!code || !packageId || baseAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: code, packageId, baseAmount",
      });
    }

    const evalResult = await evaluateCoupon({
      code,
      userId,
      planId: packageId,
      billingPeriod,
      currency,
      baseAmount: Number(baseAmount),
    });

    if (!evalResult.ok) {
      return res.status(400).json({ success: false, message: evalResult.message });
    }

    const c = evalResult.coupon;
    const limit = c.maxRedemptions != null ? c.maxRedemptions : c.maxUsageLimit || 100;
    const used = c.redeemedCount != null ? c.redeemedCount : c.usedCount || 0;

    res.json({
      success: true,
      message: "Promo code applied successfully!",
      promo: {
        code: c.code,
        name: c.name || c.code,
        discountType: c.type || c.discountType || "percent",
        discountValue: c.percent != null ? c.percent : c.discountValue,
        discountAmount: evalResult.discountAmount,
        finalAmount: evalResult.finalAmount,
        slotsRemaining: Math.max(0, limit - used),
      },
    });
  } catch (error) {
    console.error("❌ Error verifying promo code:", error);
    res.status(500).json({ success: false, message: "Failed to verify promo code" });
  }
};

// ─────────────────────────────────────────────────────────────
//  INTERNAL: Consume a promo code (called after successful payment)
// ─────────────────────────────────────────────────────────────
exports.consumePromoCode = async (code, userId, orderId = null, discountAmount = 0, currency = "INR") => {
  if (!code) return;
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) return;

    await recordRedemption({
      couponId: coupon._id,
      userId,
      orderId: orderId || `DIRECT_${Date.now()}`,
      discountAmount,
      currency,
    });
    console.log(`✅ Promo code ${code} consumed by user ${userId}.`);
  } catch (err) {
    console.error("❌ Failed to consume promo code:", err);
  }
};

// ─────────────────────────────────────────────────────────────
//  ADMIN: Get ALL promo codes (with full detail)
// ─────────────────────────────────────────────────────────────
exports.adminGetAllPromoCodes = async (req, res) => {
  try {
    const codes = await Coupon.find({})
      .select("-usedBy")
      .sort({ createdAt: -1 })
      .lean();

    // Normalize properties for the admin UI
    const formatted = codes.map((c) => ({
      ...c,
      discountType: c.discountType || c.type || "percent",
      discountValue: c.discountValue != null ? c.discountValue : c.percent || 0,
      maxUsageLimit: c.maxUsageLimit != null ? c.maxUsageLimit : c.maxRedemptions || 100,
      usedCount: c.usedCount != null ? c.usedCount : c.redeemedCount || 0,
      isActive: c.isActive !== undefined ? c.isActive : c.active !== undefined ? c.active : true,
      restrictedToPlans: c.restrictedToPlans && c.restrictedToPlans.length ? c.restrictedToPlans : c.plans || [],
      validUntil: c.validUntil || c.validTo || null,
    }));

    res.json({ success: true, promoCodes: formatted });
  } catch (error) {
    console.error("❌ Admin get promo codes error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch promo codes" });
  }
};

// ─────────────────────────────────────────────────────────────
//  ADMIN: Create a new promo code
// ─────────────────────────────────────────────────────────────
exports.adminCreatePromoCode = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      applicableTo,
      restrictedToPlans,
      minOrderAmount,
      maxDiscountCap,
      maxUsageLimit,
      perUserLimit,
      isActive,
      validFrom,
      validUntil,
    } = req.body;

    // Validate required fields
    if (!code || !name || !discountType || discountValue === undefined || !maxUsageLimit) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: code, name, discountType, discountValue, maxUsageLimit",
      });
    }

    if (discountType === "percent" && (discountValue <= 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: "Percent discount must be between 1 and 100",
      });
    }
    if (discountType === "flat" && discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Flat discount must be greater than 0",
      });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A promo code with this code already exists",
      });
    }

    const promo = new Coupon({
      code: cleanCode,
      name,
      description: description || "",
      type: discountType,
      discountType,
      percent: discountType === "percent" ? Number(discountValue) : undefined,
      discountValue: Number(discountValue),
      flat:
        discountType === "flat"
          ? { INR: Number(discountValue), USD: Number(discountValue) }
          : { INR: 0, USD: 0 },
      applicableTo: applicableTo || "all",
      plans: restrictedToPlans || [],
      restrictedToPlans: restrictedToPlans || [],
      minOrderAmount: minOrderAmount || 0,
      maxDiscountCap: maxDiscountCap || 0,
      maxDiscount:
        maxDiscountCap > 0 ? { INR: Number(maxDiscountCap), USD: Number(maxDiscountCap) } : undefined,
      maxUsageLimit: Number(maxUsageLimit),
      maxRedemptions: Number(maxUsageLimit),
      perUserLimit: perUserLimit || 1,
      isActive: isActive !== undefined ? isActive : true,
      active: isActive !== undefined ? isActive : true,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      validTo: validUntil ? new Date(validUntil) : null,
    });

    await promo.save();
    console.log(`✅ Promo code created: ${promo.code} by admin ${req.user?.email || "admin"}`);

    res.status(201).json({
      success: true,
      message: "Promo code created successfully",
      promoCode: promo,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A promo code with this code already exists",
      });
    }
    console.error("❌ Admin create promo code error:", error);
    res.status(500).json({ success: false, message: "Failed to create promo code" });
  }
};

// ─────────────────────────────────────────────────────────────
//  ADMIN: Update a promo code
// ─────────────────────────────────────────────────────────────
exports.adminUpdatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    delete updates.code;
    delete updates.usedCount;
    delete updates.redeemedCount;
    delete updates.usedBy;
    delete updates._id;

    if (updates.discountType === "percent" && updates.discountValue > 100) {
      return res.status(400).json({ success: false, message: "Percent discount cannot exceed 100" });
    }

    if (updates.discountType) {
      updates.type = updates.discountType;
    }
    if (updates.discountValue !== undefined) {
      if (updates.discountType === "percent" || updates.type === "percent") {
        updates.percent = Number(updates.discountValue);
      } else {
        updates.flat = { INR: Number(updates.discountValue), USD: Number(updates.discountValue) };
      }
    }
    if (updates.maxDiscountCap !== undefined) {
      updates.maxDiscount = {
        INR: Number(updates.maxDiscountCap),
        USD: Number(updates.maxDiscountCap),
      };
    }
    if (updates.restrictedToPlans) {
      updates.plans = updates.restrictedToPlans;
    }
    if (updates.maxUsageLimit !== undefined) {
      updates.maxRedemptions = Number(updates.maxUsageLimit);
    }
    if (updates.isActive !== undefined) {
      updates.active = updates.isActive;
    }
    if (updates.validUntil) {
      updates.validTo = new Date(updates.validUntil);
    }

    updates.updatedAt = new Date();

    const promo = await Coupon.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-usedBy");

    if (!promo) {
      return res.status(404).json({ success: false, message: "Promo code not found" });
    }

    console.log(`✅ Promo code updated: ${promo.code} by admin ${req.user?.email || "admin"}`);
    res.json({ success: true, message: "Promo code updated successfully", promoCode: promo });
  } catch (error) {
    console.error("❌ Admin update promo code error:", error);
    res.status(500).json({ success: false, message: "Failed to update promo code" });
  }
};

// ─────────────────────────────────────────────────────────────
//  ADMIN: Toggle active/inactive
// ─────────────────────────────────────────────────────────────
exports.adminTogglePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await Coupon.findById(id);

    if (!promo) {
      return res.status(404).json({ success: false, message: "Promo code not found" });
    }

    const newActive = promo.isActive !== undefined ? !promo.isActive : !promo.active;
    promo.isActive = newActive;
    promo.active = newActive;
    promo.updatedAt = new Date();
    await promo.save();

    console.log(`✅ Promo code ${promo.code} toggled to ${newActive ? "active" : "inactive"}`);

    res.json({
      success: true,
      message: `Promo code ${newActive ? "activated" : "deactivated"} successfully`,
      isActive: newActive,
      code: promo.code,
    });
  } catch (error) {
    console.error("❌ Admin toggle promo code error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle promo code" });
  }
};

// ─────────────────────────────────────────────────────────────
//  ADMIN: Delete a promo code
// ─────────────────────────────────────────────────────────────
exports.adminDeletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await Coupon.findByIdAndDelete(id);

    if (!promo) {
      return res.status(404).json({ success: false, message: "Promo code not found" });
    }

    console.log(`✅ Promo code deleted: ${promo.code}`);
    res.json({ success: true, message: `Promo code "${promo.code}" deleted successfully` });
  } catch (error) {
    console.error("❌ Admin delete promo code error:", error);
    res.status(500).json({ success: false, message: "Failed to delete promo code" });
  }
};

// ─────────────────────────────────────────────────────────────
//  ADMIN: Get usage details for a specific promo code
// ─────────────────────────────────────────────────────────────
exports.adminGetPromoUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await Coupon.findById(id)
      .populate("usedBy.userId", "name email mobile")
      .lean();

    if (!promo) {
      return res.status(404).json({ success: false, message: "Promo code not found" });
    }

    const redemptions = await CouponRedemption.find({ couponId: promo._id })
      .populate("userId", "name email mobile")
      .sort({ createdAt: -1 })
      .lean();

    const usedCount = promo.redeemedCount != null ? promo.redeemedCount : promo.usedCount || 0;
    const maxLimit = promo.maxRedemptions != null ? promo.maxRedemptions : promo.maxUsageLimit || 100;

    res.json({
      success: true,
      promoCode: {
        code: promo.code,
        name: promo.name || promo.code,
        usedCount,
        maxUsageLimit: maxLimit,
        slotsRemaining: Math.max(0, maxLimit - usedCount),
      },
      usedBy: promo.usedBy || [],
      redemptions: redemptions || [],
    });
  } catch (error) {
    console.error("❌ Admin get promo usage error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch usage data" });
  }
};
