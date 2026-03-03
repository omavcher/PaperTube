// controllers/promoController.js
const PromoCode = require("../models/PromoCode");
const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────
//  PUBLIC: Get visible active promo codes (shows code + discount,
//  but NOT usedBy list or sensitive tracking data)
// ─────────────────────────────────────────────────────────────
exports.getActivePromoCodes = async (req, res) => {
  try {
    const now = new Date();

    const codes = await PromoCode.find(
      {
        isActive: true,
        $expr: { $lt: ["$usedCount", "$maxUsageLimit"] },
        $and: [
          { $or: [{ validUntil: null }, { validUntil: { $gte: now } }] },
          { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] }
        ]
      },
      {
        code: 1,
        name: 1,
        description: 1,
        discountType: 1,
        discountValue: 1,
        applicableTo: 1,
        restrictedToPlans: 1,
        maxUsageLimit: 1,
        usedCount: 1,
        maxDiscountCap: 1,
        minOrderAmount: 1,
        validUntil: 1
      }
    ).lean();

    // Attach slots-remaining and urgency flag
    const publicCodes = codes.map((c) => ({
      code: c.code,
      name: c.name,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      applicableTo: c.applicableTo,
      restrictedToPlans: c.restrictedToPlans,
      maxDiscountCap: c.maxDiscountCap,
      minOrderAmount: c.minOrderAmount,
      slotsRemaining: Math.max(0, c.maxUsageLimit - c.usedCount),
      validUntil: c.validUntil,
      // Show urgency when < 20% slots remain
      isAlmostGone: c.maxUsageLimit - c.usedCount <= Math.ceil(c.maxUsageLimit * 0.2)
    }));

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
    const { code, packageId, packageType, baseAmount } = req.body;
    const userId = req.user._id;

    if (!code || !packageId || !packageType || baseAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: code, packageId, packageType, baseAmount"
      });
    }

    const now = new Date();
    const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() });

    // 1. Does the code exist?
    if (!promo) {
      return res.status(404).json({ success: false, message: "Invalid promo code" });
    }

    // 2. Is it active?
    if (!promo.isActive) {
      return res.status(400).json({ success: false, message: "This promo code is currently inactive" });
    }

    // 3. Validity window
    if (promo.validFrom && now < promo.validFrom) {
      return res.status(400).json({ success: false, message: "This promo code is not active yet" });
    }
    if (promo.validUntil && now > promo.validUntil) {
      return res.status(400).json({ success: false, message: "This promo code has expired" });
    }

    // 4. Global usage limit
    if (promo.usedCount >= promo.maxUsageLimit) {
      return res.status(400).json({ success: false, message: "This promo code has reached its usage limit" });
    }

    // 5. Per-user usage limit
    const userUsage = promo.usedBy.find(
      (u) => u.userId.toString() === userId.toString()
    );
    if (userUsage && userUsage.timesUsed >= promo.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: promo.perUserLimit === 1
          ? "You have already used this promo code"
          : `You have reached the usage limit for this promo code (${promo.perUserLimit}x)`
      });
    }

    // 6. Applicable plan type
    if (promo.applicableTo !== "all" && promo.applicableTo !== packageType) {
      const label = promo.applicableTo === "subscription" ? "subscription plans" : "token packages";
      return res.status(400).json({
        success: false,
        message: `This promo code is only valid for ${label}`
      });
    }

    // 7. Restricted to specific plan IDs
    if (promo.restrictedToPlans && promo.restrictedToPlans.length > 0) {
      if (!promo.restrictedToPlans.includes(packageId)) {
        return res.status(400).json({
          success: false,
          message: `This promo code is not valid for the selected plan`
        });
      }
    }

    // 8. Minimum order amount
    const orderBase = parseFloat(baseAmount);
    if (promo.minOrderAmount > 0 && orderBase < promo.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `This promo code requires a minimum order of ₹${promo.minOrderAmount}`
      });
    }

    // ─── Calculate discount ───
    let discountAmount = 0;
    if (promo.discountType === "percent") {
      discountAmount = (orderBase * promo.discountValue) / 100;
      // Apply cap if set
      if (promo.maxDiscountCap > 0) {
        discountAmount = Math.min(discountAmount, promo.maxDiscountCap);
      }
    } else {
      // flat discount — can't exceed the base amount
      discountAmount = Math.min(promo.discountValue, orderBase);
    }

    discountAmount = parseFloat(discountAmount.toFixed(2));

    res.json({
      success: true,
      message: "Promo code applied successfully!",
      promo: {
        code: promo.code,
        name: promo.name,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount,
        slotsRemaining: Math.max(0, promo.maxUsageLimit - promo.usedCount)
      }
    });
  } catch (error) {
    console.error("❌ Error verifying promo code:", error);
    res.status(500).json({ success: false, message: "Failed to verify promo code" });
  }
};

// ─────────────────────────────────────────────────────────────
//  INTERNAL: Consume a promo code (called after successful payment)
// ─────────────────────────────────────────────────────────────
exports.consumePromoCode = async (code, userId) => {
  if (!code) return;
  try {
    const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() });
    if (!promo) return;

    promo.usedCount += 1;

    const existing = promo.usedBy.find(
      (u) => u.userId.toString() === userId.toString()
    );
    if (existing) {
      existing.timesUsed += 1;
    } else {
      promo.usedBy.push({ userId, usedAt: new Date(), timesUsed: 1 });
    }

    await promo.save();
    console.log(`✅ Promo code ${code} consumed by user ${userId}. Total uses: ${promo.usedCount}`);
  } catch (err) {
    console.error("❌ Failed to consume promo code:", err);
  }
};

// ─────────────────────────────────────────────────────────────
//  ADMIN: Get ALL promo codes (with full detail)
// ─────────────────────────────────────────────────────────────
exports.adminGetAllPromoCodes = async (req, res) => {
  try {
    const codes = await PromoCode.find({})
      .select("-usedBy")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, promoCodes: codes });
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
      validUntil
    } = req.body;

    // Validate required
    if (!code || !name || !discountType || discountValue === undefined || !maxUsageLimit) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: code, name, discountType, discountValue, maxUsageLimit"
      });
    }

    // Discount value sanity check
    if (discountType === "percent" && (discountValue <= 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: "Percent discount must be between 1 and 100"
      });
    }
    if (discountType === "flat" && discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Flat discount must be greater than 0"
      });
    }

    const promo = new PromoCode({
      code: code.toUpperCase().trim(),
      name,
      description: description || "",
      discountType,
      discountValue,
      applicableTo: applicableTo || "all",
      restrictedToPlans: restrictedToPlans || [],
      minOrderAmount: minOrderAmount || 0,
      maxDiscountCap: maxDiscountCap || 0,
      maxUsageLimit,
      perUserLimit: perUserLimit || 1,
      isActive: isActive !== undefined ? isActive : true,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null
    });

    await promo.save();

    console.log(`✅ Promo code created: ${promo.code} by admin ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: "Promo code created successfully",
      promoCode: promo
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A promo code with this code already exists"
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
    const updates = req.body;

    // Prevent changing the code itself (to avoid confusion with usage tracking)
    delete updates.code;
    delete updates.usedCount;
    delete updates.usedBy;
    delete updates._id;

    if (updates.discountType === "percent" && updates.discountValue > 100) {
      return res.status(400).json({ success: false, message: "Percent discount cannot exceed 100" });
    }

    updates.updatedAt = new Date();

    const promo = await PromoCode.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).select("-usedBy");

    if (!promo) {
      return res.status(404).json({ success: false, message: "Promo code not found" });
    }

    console.log(`✅ Promo code updated: ${promo.code} by admin ${req.user.email}`);

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
    const promo = await PromoCode.findById(id);

    if (!promo) {
      return res.status(404).json({ success: false, message: "Promo code not found" });
    }

    promo.isActive = !promo.isActive;
    promo.updatedAt = new Date();
    await promo.save();

    console.log(`✅ Promo code ${promo.code} toggled to ${promo.isActive ? "active" : "inactive"} by admin ${req.user.email}`);

    res.json({
      success: true,
      message: `Promo code ${promo.isActive ? "activated" : "deactivated"} successfully`,
      isActive: promo.isActive,
      code: promo.code
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
    const promo = await PromoCode.findByIdAndDelete(id);

    if (!promo) {
      return res.status(404).json({ success: false, message: "Promo code not found" });
    }

    console.log(`✅ Promo code deleted: ${promo.code} by admin ${req.user.email}`);

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
    const promo = await PromoCode.findById(id)
      .populate("usedBy.userId", "name email")
      .lean();

    if (!promo) {
      return res.status(404).json({ success: false, message: "Promo code not found" });
    }

    res.json({
      success: true,
      promoCode: {
        code: promo.code,
        name: promo.name,
        usedCount: promo.usedCount,
        maxUsageLimit: promo.maxUsageLimit,
        slotsRemaining: Math.max(0, promo.maxUsageLimit - promo.usedCount)
      },
      usedBy: promo.usedBy || []
    });
  } catch (error) {
    console.error("❌ Admin get promo usage error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch usage data" });
  }
};
