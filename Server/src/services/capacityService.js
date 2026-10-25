// services/capacityService.js
// Percentage-based capacity engine with 75% profit margin protection and zero credit/token jargon
const User = require("../models/User");
const AiUsageLog = require("../models/AiUsageLog");

// ── Feature Weight Units ───────────────────────────────────────────────────────
// Reflects computational & financial cost (Images cost ~100x-300x more than standard text)
const FEATURE_WEIGHTS = {
  chat: 1,
  chat_message: 1,
  study_homework: 2,
  study_math: 2,
  study_solve: 2,
  flashcards: 3,
  code_solver: 3,
  diagram: 3,
  test_quiz: 3,
  study_planner: 3,
  study_tutor: 3,
  writer_detect: 3,
  writer_humanize: 4,
  agent: 5,
  whiteboard: 5,
  writer_essay: 8,
  notes_engine: 10,
  notes_free: 10,
  notes_premium: 10,
  presentation: 10,
  agent_image: 15,
  image_gen: 15,
  other: 2,
};

// ── Plan Capacity Configurations ──────────────────────────────────────────────
// Hard cost ceilings guarantee 75% gross profit margin:
// Pro: $9.99 revenue - $2.50 max COGS = $7.49 net profit (75% margin)
// Power: $19.99 revenue - $5.00 max COGS = $14.99 net profit (75% margin)
const PLAN_CONFIGS = {
  free: {
    planId: "free",
    displayName: "Free Tier",
    period: "daily",
    allocatedUnits: 50,
    maxImages: 2,
    maxVideoMinutes: 60,
    hardCostCeilingUSD: 0.15, // Max $0.15/month for free acquisition
    resetDescription: "Tonight at midnight IST",
  },
  pro: {
    planId: "pro",
    displayName: "Pro Scholar",
    period: "monthly",
    allocatedUnits: 1500,
    maxImages: 25,
    maxVideoMinutes: 240,
    hardCostCeilingUSD: 2.50, // 75% net profit margin on $9.99
    resetDescription: "With your active 30-day billing cycle",
  },
  power: {
    planId: "power",
    displayName: "Power Scholar",
    period: "monthly",
    allocatedUnits: 4500,
    maxImages: 80,
    maxVideoMinutes: 480,
    hardCostCeilingUSD: 5.00, // 75% net profit margin on $19.99
    resetDescription: "With your active 30-day billing cycle",
  },
};

/**
 * Determine the user's active plan ID ('free', 'pro', 'power')
 */
function getUserPlanId(user) {
  if (!user) return "free";
  const membershipActive = Boolean(user.membership?.isActive);
  const pkgType = String(user.packageType || "").toLowerCase();
  const planStr = String(user.membership?.planId || pkgType || "").toLowerCase();

  // If user has an active membership or packageType other than free
  const isActive = membershipActive || (pkgType && pkgType !== "free");
  if (!isActive) return "free";

  if (user.membership?.expiresAt) {
    const expiresAt = new Date(user.membership.expiresAt);
    if (expiresAt <= new Date()) return "free";
  }

  if (planStr.includes("power") || planStr.includes("premium")) return "power";
  if (planStr.includes("pro")) return "pro";
  return "pro";
}

/**
 * Calculate user capacity percentage (0 to 100)
 */
function calculateCapacityPercentage(usedUnits, allocatedUnits, hardCostUSD, hardCostCeilingUSD) {
  const unitsRatio = allocatedUnits > 0 ? usedUnits / allocatedUnits : 1;
  const costRatio = hardCostCeilingUSD > 0 ? hardCostUSD / hardCostCeilingUSD : 0;
  // Use the higher of unit consumption or financial cost
  const rawRatio = Math.max(unitsRatio, costRatio);
  return Math.min(100, Math.max(0, Math.round(rawRatio * 100)));
}

/**
 * Get visual status label based on capacity percentage
 */
function getCapacityStatus(percentage) {
  if (percentage >= 100) return "exceeded";
  if (percentage >= 90) return "critical";
  if (percentage >= 70) return "high";
  return "optimal";
}

/**
 * Get comprehensive capacity status for a user
 * Returns percentage, remaining percentage, status, and reset info (zero credit/token words)
 */
async function getUserCapacity(userId) {
  const user = await User.findById(userId).select("membership name email aiCapacity tokens");
  if (!user) {
    throw new Error("User not found");
  }

  const planId = getUserPlanId(user);
  const planConfig = PLAN_CONFIGS[planId] || PLAN_CONFIGS.free;

  // Always use the active plan configuration's allocatedUnits (or higher)
  const allocatedUnits = Math.max(user.aiCapacity?.allocatedUnits || 0, planConfig.allocatedUnits);
  let usedUnits = user.aiCapacity?.usedUnits || 0;
  let hardCostUSD = user.aiCapacity?.hardCostUSD || 0;
  let imagesGenerated = user.aiCapacity?.imagesGenerated || 0;

  // Check 30-day monthly or daily auto-reset
  let resetsAt = planConfig.resetDescription;
  if (planId === "free") {
    resetsAt = "Tonight at midnight UTC";
  } else {
    const lastReset = user.aiCapacity?.lastReset ? new Date(user.aiCapacity.lastReset) : new Date(user.membership?.startedAt || Date.now());
    const nextResetDate = new Date(lastReset.getTime() + 30 * 24 * 60 * 60 * 1000);
    const msLeft = nextResetDate.getTime() - Date.now();
    if (msLeft <= 0) {
      usedUnits = 0;
      hardCostUSD = 0;
      imagesGenerated = 0;
      resetsAt = "Refreshed today";
      User.findByIdAndUpdate(userId, {
        $set: {
          "aiCapacity.usedUnits": 0,
          "aiCapacity.hardCostUSD": 0,
          "aiCapacity.imagesGenerated": 0,
          "aiCapacity.lastReset": new Date(),
          "aiCapacity.allocatedUnits": planConfig.allocatedUnits,
          tokens: planConfig.allocatedUnits
        }
      }).catch(() => {});
    } else {
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      resetsAt = daysLeft === 1 ? "Tomorrow" : `In ${daysLeft} days`;
    }
  }

  const percentage = calculateCapacityPercentage(
    usedUnits,
    allocatedUnits,
    hardCostUSD,
    planConfig.hardCostCeilingUSD
  );

  const remainingPercentage = Math.max(0, 100 - percentage);
  const status = getCapacityStatus(percentage);

  return {
    percentage,
    remainingPercentage,
    status,
    resetsAt,
    planId,
    planName: planConfig.displayName,
    period: planConfig.period,
    maxVideoMinutes: planConfig.maxVideoMinutes,
    maxImages: planConfig.maxImages,
    imagesGenerated,
    usedUnits,
    allocatedUnits,
    isExceeded: percentage >= 100,
  };
}

/**
 * Perform automatic daily/monthly quota reset if period has lapsed
 */
async function checkAndApplyAutoReset(user) {
  if (!user || !user._id) return user;
  const planId = getUserPlanId(user);
  const planConfig = PLAN_CONFIGS[planId] || PLAN_CONFIGS.free;

  const now = new Date();
  const lastReset = user.aiCapacity?.lastReset ? new Date(user.aiCapacity.lastReset) : new Date(user.createdAt || now);

  let shouldReset = false;

  if (planId === "free") {
    // Daily reset: reset if last reset was on a previous calendar day (UTC)
    const lastDay = new Date(Date.UTC(lastReset.getUTCFullYear(), lastReset.getUTCMonth(), lastReset.getUTCDate()));
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    if (today.getTime() > lastDay.getTime()) {
      shouldReset = true;
    }
  } else {
    // 30-day billing cycle reset
    const cycleMs = 30 * 24 * 60 * 60 * 1000;
    if (now.getTime() - lastReset.getTime() >= cycleMs) {
      shouldReset = true;
    }
  }

  if (shouldReset) {
    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          "aiCapacity.usedUnits": 0,
          "aiCapacity.hardCostUSD": 0,
          "aiCapacity.imagesGenerated": 0,
          "aiCapacity.lastReset": now,
          "aiCapacity.allocatedUnits": planConfig.allocatedUnits,
          tokens: planConfig.allocatedUnits,
        },
      },
      { new: true, select: "membership aiCapacity tokens" }
    );
    return updated || user;
  }

  return user;
}

/**
 * Pre-flight check before any AI action or image generation
 * Returns { allowed: true } or { allowed: false, errorPayload }
 */
async function checkCanExecute(userId, feature, options = {}) {
  let user = await User.findById(userId).select("membership aiCapacity createdAt");
  if (!user) {
    return {
      allowed: false,
      errorPayload: {
        success: false,
        code: "AUTH_REQUIRED",
        title: "Authentication Required",
        message: "Please sign in to continue using Paperxify AI study tools.",
      },
    };
  }

  // Check and apply automatic period reset
  user = await checkAndApplyAutoReset(user);

  const planId = getUserPlanId(user);
  const planConfig = PLAN_CONFIGS[planId] || PLAN_CONFIGS.free;

  const usedUnits = user.aiCapacity?.usedUnits || 0;
  const allocatedUnits = Math.max(user.aiCapacity?.allocatedUnits || 0, planConfig.allocatedUnits);
  const hardCostUSD = user.aiCapacity?.hardCostUSD || 0;
  const imagesGenerated = user.aiCapacity?.imagesGenerated || 0;

  // 1. Check video duration limit (if applicable)
  const durationMin = Number(options.durationMin || options.videoDurationMin || 0);
  if (durationMin > 0 && durationMin > planConfig.maxVideoMinutes) {
    return {
      allowed: false,
      errorPayload: {
        success: false,
        code: "VIDEO_TOO_LONG",
        title: "That's a Heavy Lecture! 📚",
        message: `Your ${planConfig.displayName} supports lectures up to ${planConfig.maxVideoMinutes} minutes. This video is ${Math.round(durationMin)} minutes.`,
        solution: planId === "free"
          ? "Upgrade to Pro Scholar to process marathon lectures, playlist courses, and symposia up to 4 hours long."
          : "Upgrade to Power Scholar to process full playlists and courses up to 8 hours long.",
        maxAllowedMinutes: planConfig.maxVideoMinutes,
        videoDurationMinutes: durationMin,
        upgradeUrl: "/pricing",
        recommendedPlan: planId === "free" ? "pro" : "power",
      },
    };
  }

  // 2. Check image limits (if applicable)
  const isImageAction = feature === "agent_image" || feature === "image_gen" || feature === "image";
  if (isImageAction && imagesGenerated >= planConfig.maxImages) {
    return {
      allowed: false,
      errorPayload: {
        success: false,
        code: "QUOTA_EXCEEDED",
        errorType: "IMAGE_LIMIT_REACHED",
        title: "Visual Studio Cap Reached 🎨",
        message: `You've reached the maximum image synthesis allowance for your ${planConfig.displayName} (${planConfig.maxImages} images).`,
        solution: planId === "free"
          ? "Upgrade to Pro Scholar for 25 high-resolution concept diagrams and visual aids each month."
          : "Upgrade to Power Scholar for 80 monthly studio illustrations and priority generation.",
        capacity: {
          percentage: 100,
          remainingPercentage: 0,
          status: "exceeded",
          resetsAt: planConfig.resetDescription,
        },
        upgradeUrl: "/pricing",
        recommendedPlan: planId === "free" ? "pro" : "power",
      },
    };
  }

  // 3. Check general capacity percentage & 75% profit hard cost ceiling
  const currentPercentage = calculateCapacityPercentage(
    usedUnits,
    allocatedUnits,
    hardCostUSD,
    planConfig.hardCostCeilingUSD
  );

  if (currentPercentage >= 100) {
    const isFree = planId === "free";
    return {
      allowed: false,
      errorPayload: {
        success: false,
        code: "QUOTA_EXCEEDED",
        errorType: "CAPACITY_REACHED",
        title: isFree
          ? "You've Reached 100% of Today's Study Capacity! 🎓"
          : "Semester Milestone Reached! 100% Monthly Capacity ⚡",
        message: isFree
          ? "You've completed your daily study allowance on Free Tier. Your capacity resets tonight at midnight."
          : "You've processed full capacity for this billing cycle. Upgrade for expanded capacity or wait for cycle reset.",
        examHook: isFree
          ? "Studying for midterms or finals tomorrow? Upgrade to Pro Scholar to unlock 10x more study capacity, 4-hour video processing, and priority speed."
          : "Need extra power for finals week? Switch to Power Scholar for 3x more capacity and 8-hour mega lectures.",
        capacity: {
          percentage: 100,
          remainingPercentage: 0,
          status: "exceeded",
          resetsAt: planConfig.resetDescription,
          plan: planConfig.displayName,
        },
        upgradeUrl: "/pricing",
        recommendedPlan: isFree ? "pro" : "power",
      },
    };
  }

  return { allowed: true };
}

/**
 * ATOMIC UNIT RESERVATION — Mathematically eliminates race conditions
 * Conditionally reserves computational units in a single atomic findOneAndUpdate.
 * If concurrent requests hit simultaneously, only requests that fit in the remaining capacity succeed.
 */
async function reserveCapacity(userId, feature = "other", options = {}) {
  if (!userId || userId === "guest") {
    return { success: true, isGuest: true, reservedUnits: 0 };
  }

  let user = await User.findById(userId).select("membership aiCapacity createdAt tokens");
  if (!user) {
    return {
      success: false,
      errorPayload: {
        success: false,
        code: "AUTH_REQUIRED",
        title: "Authentication Required",
        message: "Please sign in to continue using Paperxify AI study tools.",
      },
    };
  }

  // Apply auto-reset if period elapsed
  user = await checkAndApplyAutoReset(user);

  const planId = getUserPlanId(user);
  const planConfig = PLAN_CONFIGS[planId] || PLAN_CONFIGS.free;

  // 1. Duration check
  const durationMin = Number(options.durationMin || options.videoDurationMin || 0);
  if (durationMin > 0 && durationMin > planConfig.maxVideoMinutes) {
    return {
      success: false,
      errorPayload: {
        success: false,
        code: "VIDEO_TOO_LONG",
        title: "That's a Heavy Lecture! 📚",
        message: `Your ${planConfig.displayName} supports lectures up to ${planConfig.maxVideoMinutes} minutes. This video is ${Math.round(durationMin)} minutes.`,
        solution: planId === "free"
          ? "Upgrade to Pro Scholar to process marathon lectures, playlist courses, and symposia up to 4 hours long."
          : "Upgrade to Power Scholar to process full playlists and courses up to 8 hours long.",
        maxAllowedMinutes: planConfig.maxVideoMinutes,
        videoDurationMinutes: durationMin,
        upgradeUrl: "/pricing",
        recommendedPlan: planId === "free" ? "pro" : "power",
      },
    };
  }

  // 2. Image limits check
  const isImageAction = feature === "agent_image" || feature === "image_gen" || feature === "image";
  const imagesGenerated = user.aiCapacity?.imagesGenerated || 0;
  if (isImageAction && imagesGenerated >= planConfig.maxImages) {
    return {
      success: false,
      errorPayload: {
        success: false,
        code: "QUOTA_EXCEEDED",
        errorType: "IMAGE_LIMIT_REACHED",
        title: "Visual Studio Cap Reached 🎨",
        message: `You've reached the maximum image synthesis allowance for your ${planConfig.displayName} (${planConfig.maxImages} images).`,
        solution: planId === "free"
          ? "Upgrade to Pro Scholar for 25 high-resolution concept diagrams and visual aids each month."
          : "Upgrade to Power Scholar for 80 monthly studio illustrations and priority generation.",
        capacity: {
          percentage: 100,
          remainingPercentage: 0,
          status: "exceeded",
          resetsAt: planConfig.resetDescription,
        },
        upgradeUrl: "/pricing",
        recommendedPlan: planId === "free" ? "pro" : "power",
      },
    };
  }

  const weightUnits = FEATURE_WEIGHTS[feature] || (isImageAction ? 15 : 2);
  const allocatedUnits = Math.max(user.aiCapacity?.allocatedUnits || 0, planConfig.allocatedUnits);

  // 3. Atomic Conditional Reservation Query
  // Must satisfy: current usedUnits + weightUnits <= allocatedUnits AND hardCostUSD < hardCostCeilingUSD
  const filter = {
    _id: userId,
    "aiCapacity.usedUnits": { $lte: Math.max(0, allocatedUnits - weightUnits) },
    "aiCapacity.hardCostUSD": { $lt: planConfig.hardCostCeilingUSD },
  };

  const update = {
    $inc: {
      "aiCapacity.usedUnits": weightUnits,
      ...(isImageAction ? { "aiCapacity.imagesGenerated": 1 } : {}),
    },
  };

  const updatedUser = await User.findOneAndUpdate(filter, update, {
    new: true,
    select: "aiCapacity membership tokens",
  });

  if (!updatedUser) {
    // Atomic reservation failed — capacity or cost ceiling exceeded
    const isFree = planId === "free";
    return {
      success: false,
      errorPayload: {
        success: false,
        code: "QUOTA_EXCEEDED",
        errorType: "CAPACITY_REACHED",
        title: isFree
          ? "You've Reached 100% of Today's Study Capacity! 🎓"
          : "Semester Milestone Reached! 100% Monthly Capacity ⚡",
        message: isFree
          ? "You've completed your daily study allowance on Free Tier. Your capacity resets tonight at midnight."
          : "You've processed full capacity for this billing cycle. Upgrade for expanded capacity or wait for cycle reset.",
        examHook: isFree
          ? "Studying for midterms or finals tomorrow? Upgrade to Pro Scholar to unlock 10x more study capacity, 4-hour video processing, and priority speed."
          : "Need extra power for finals week? Switch to Power Scholar for 3x more capacity and 8-hour mega lectures.",
        capacity: {
          percentage: 100,
          remainingPercentage: 0,
          status: "exceeded",
          resetsAt: planConfig.resetDescription,
          plan: planConfig.displayName,
        },
        upgradeUrl: "/pricing",
        recommendedPlan: isFree ? "pro" : "power",
      },
    };
  }

  return {
    success: true,
    userId,
    feature,
    planId,
    planName: planConfig.displayName,
    reservedUnits: weightUnits,
    isImageAction,
    usedUnits: updatedUser.aiCapacity?.usedUnits || 0,
    allocatedUnits,
  };
}

/**
 * Release/Refund previously reserved capacity if AI generation failed or aborted
 */
async function releaseCapacity(userId, feature = "other", reservedUnits = 0, isImageAction = false) {
  if (!userId || userId === "guest" || reservedUnits <= 0) return;

  try {
    const incFields = {
      "aiCapacity.usedUnits": -Math.abs(reservedUnits),
    };
    if (isImageAction) {
      incFields["aiCapacity.imagesGenerated"] = -1;
    }

    await User.findByIdAndUpdate(userId, { $inc: incFields });
    console.log(`↩️ [CapacityEngine] Refunded ${reservedUnits} units for user ${userId} (${feature})`);
  } catch (err) {
    console.warn("⚠️ Error releasing capacity reservation:", err.message);
  }
}

/**
 * Record usage after an AI request succeeds
 * Atomically updates user's hardCostUSD and logs exact metrics to AiUsageLog
 */
async function recordUsage({
  userId,
  feature = "other",
  model = "unknown",
  type = "text",
  promptTokens = 0,
  completionTokens = 0,
  totalTokens = 0,
  costUSD = 0,
  status = "success",
  errorMessage = null,
  metadata = {},
  unitsAlreadyReserved = false,
}) {
  if (!userId || userId === "guest") return null;

  try {
    const weightUnits = FEATURE_WEIGHTS[feature] || (type === "image" ? 15 : 2);
    const isImage = type === "image" || feature === "agent_image" || feature === "image_gen" || feature === "image";

    // 1. Create audit log
    const logDoc = await AiUsageLog.create({
      userId,
      feature,
      model,
      type: isImage ? "image" : "text",
      promptTokens: Number(promptTokens) || 0,
      completionTokens: Number(completionTokens) || 0,
      totalTokens: Number(totalTokens) || 0,
      costUSD: Number(costUSD) || 0,
      capacityUnits: weightUnits,
      status,
      errorMessage,
      metadata,
    });

    // 2. Increment user cost counters (and units if not already reserved by middleware)
    const incFields = {
      "aiCapacity.hardCostUSD": Number(costUSD) || 0,
    };
    if (!unitsAlreadyReserved) {
      incFields["aiCapacity.usedUnits"] = weightUnits;
      if (isImage) {
        incFields["aiCapacity.imagesGenerated"] = 1;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: incFields },
      { new: true, select: "aiCapacity membership tokens" }
    );

    // Keep legacy tokens field synchronized
    if (updatedUser) {
      const remaining = Math.max(0, (updatedUser.aiCapacity?.allocatedUnits || 50) - (updatedUser.aiCapacity?.usedUnits || 0));
      if (updatedUser.tokens !== remaining) {
        await User.findByIdAndUpdate(userId, { $set: { tokens: remaining } }).catch(() => {});
      }
    }

    return logDoc;
  } catch (err) {
    console.error("❌ Error recording AI capacity usage:", err.message);
    return null;
  }
}

module.exports = {
  FEATURE_WEIGHTS,
  PLAN_CONFIGS,
  getUserPlanId,
  calculateCapacityPercentage,
  getUserCapacity,
  checkCanExecute,
  reserveCapacity,
  releaseCapacity,
  recordUsage,
};
