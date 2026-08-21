// middleware/quotaMiddleware.js
const User = require("../models/User");
const Note = require("../models/Note");
const Presentation = require("../models/Presentation");
const Quiz = require("../models/Quiz");
const FlashcardSet = require("../models/FlashcardSet");
const Diagram = require("../models/Diagram");
const Homework = require("../models/Homework");
const MathSolution = require("../models/MathSolution");
const ExamPlan = require("../models/ExamPlan");
const LanguageLesson = require("../models/LanguageLesson");

// ─── Paperxify Pricing v2 — Calibrated for 75%+ Net Profit Margin ────────────
// Pricing:
//   Free:          $0 / ₹0
//   Pro Scholar:   $9.99/mo  | $79.99/yr  | ₹799/mo  | ₹6,999/yr
//   Power Scholar: $19.99/mo | $149.99/yr | ₹1,599/mo | ₹12,999/yr
//
// Model routing target:
//   Flash-Lite → classification, cleanup, simple PaperChat, basic flashcards
//   Flash       → complex synthesis, detailed notes, PaperChat Tutor, PPT
//
// Target variable COGS per user/month:
//   Free: ≤ $0.25 (acquisition only)
//   Pro:  ≤ $2.00 → ~75–80% gross margin at $9.99
//   Power: ≤ $4.00 → ~75–80% gross margin at $19.99
// ─────────────────────────────────────────────────────────────────────────────

const PLAN_QUOTAS = {
  free: {
    name: "Free",
    planDisplayName: "Free Tier",
    period: "daily",        // limits reset daily at midnight UTC
    // Core generation limits (per day)
    notes: 5,              // 5 video notes / day (up to 60 min each)
    presentations: 2,      // 2 PPT decks / day (up to 8 slides)
    quizzes: 5,            // 5 quiz sets / day
    flashcards: 5,         // 5 flashcard sets / day
    diagrams: 3,           // 3 mind maps / diagrams / day
    study: 10,             // 10 math/homework solves / day
    writer: 1,             // 1 humanizer/essay run / day
    // Capability caps
    maxVideoLengthMin: 60, // 60 minutes max per video
    maxSlides: 8,
    paperChatMessages: 100, // 100 PaperChat messages / day
  },

  pro: {
    name: "Pro Scholar",
    planDisplayName: "Pro Scholar ⭐",
    period: "monthly",     // limits reset per billing cycle
    // Core generation limits (per month) — "30 hours of AI study content"
    // Internally: 120 note generations ≈ avg 15 min each = 30 hrs total
    notes: 120,            // 120 video notes / month (up to 4 hrs / video)
    presentations: 10,     // 10 PPT decks / month (up to 20 slides)
    quizzes: 30,           // 30 quiz sets / month
    flashcards: 999999,    // Unlimited basic flashcards (low AI cost, safe)
    diagrams: 15,          // 15 mind maps / diagrams / month
    study: 500,            // 500 math/homework/study solves / month
    writer: 50,            // 50 humanizer & essay scans / month
    // Capability caps
    maxVideoLengthMin: 240, // 4 hours max per video
    maxSlides: 20,
    paperChatMessages: 2000, // 2,000 PaperChat messages / month
  },

  power: {
    name: "Power Scholar",
    planDisplayName: "Power Scholar 👑",
    period: "monthly",     // limits reset per billing cycle
    // Core generation limits (per month) — "100 hours of AI study content"
    notes: 350,            // 350 video notes / month (up to 8 hrs / video)
    presentations: 30,     // 30 PPT decks / month (up to 40 slides)
    quizzes: 999999,       // Unlimited quizzes
    flashcards: 999999,    // Unlimited flashcards
    diagrams: 999999,      // Unlimited mind maps
    study: 1500,           // 1,500 math/study solves / month
    writer: 200,           // 200 humanizer & deep essay runs / month
    // Capability caps
    maxVideoLengthMin: 480, // 8 hours max per video
    maxSlides: 40,
    paperChatMessages: 10000, // 10,000 PaperChat messages / month
  }
};

/**
 * Exported pricing constants — used by the API route for plan info responses.
 * All values are in USD. Frontend handles INR conversion via localization.
 */
const PLAN_PRICING = {
  free: { monthly: 0, yearly: 0 },
  pro:  { monthly: 9.99, yearly: 79.99 },
  power: { monthly: 19.99, yearly: 149.99 },
};

/**
 * Determine the user's active plan ID ('free', 'pro', 'power')
 */
function getUserPlanId(user) {
  if (!user || !user.membership || !user.membership.isActive) return "free";
  const expiresAt = user.membership.expiresAt ? new Date(user.membership.expiresAt) : null;
  if (!expiresAt || expiresAt <= new Date()) return "free";
  
  const planId = String(user.membership.planId || "").toLowerCase();
  if (planId.includes("power") || planId.includes("premium")) return "power";
  if (planId.includes("pro")) return "pro";
  return "pro"; // default for any active paid plan
}

/**
 * Calculate the period start date.
 * - Free: today at 00:00 UTC (daily reset)
 * - Pro/Power: start of current billing cycle (anchored to subscription start date)
 */
function getPeriodStartDate(planId, membership) {
  if (planId === "free") {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
  }
  // For monthly plans: anchor to subscription start, cycle every 30 days
  if (membership && membership.startedAt) {
    const started = new Date(membership.startedAt);
    const now = new Date();
    const cycleMs = 30 * 24 * 60 * 60 * 1000;
    const diff = now.getTime() - started.getTime();
    if (diff > 0) {
      const cyclesPassed = Math.floor(diff / cycleMs);
      return new Date(started.getTime() + cyclesPassed * cycleMs);
    }
  }
  // Fallback: 30 days ago
  const fallback = new Date();
  fallback.setDate(fallback.getDate() - 30);
  return fallback;
}

/**
 * Fetch current usage count for a specific feature within a period.
 * Uses -1 sentinel for "unlimited" features to skip DB query.
 */
async function getFeatureUsageCount(userId, featureType, startDate, limit) {
  // If limit is effectively "unlimited", skip expensive DB count
  if (limit >= 999999) return 0;
  
  try {
    switch (featureType) {
      case "notes":
        return await Note.countDocuments({ userId, createdAt: { $gte: startDate } });
      case "presentations":
        return await Presentation.countDocuments({ userId, createdAt: { $gte: startDate } });
      case "quizzes":
        return await Quiz.countDocuments({ userId, createdAt: { $gte: startDate } });
      case "flashcards":
        return await FlashcardSet.countDocuments({ userId, createdAt: { $gte: startDate } });
      case "diagrams":
        return await Diagram.countDocuments({ userId, createdAt: { $gte: startDate } });
      case "study": {
        const [hw, math, plan, tutor] = await Promise.all([
          Homework.countDocuments({ userId, createdAt: { $gte: startDate } }).catch(() => 0),
          MathSolution.countDocuments({ userId, createdAt: { $gte: startDate } }).catch(() => 0),
          ExamPlan.countDocuments({ userId, createdAt: { $gte: startDate } }).catch(() => 0),
          LanguageLesson.countDocuments({ userId, createdAt: { $gte: startDate } }).catch(() => 0),
        ]);
        return hw + math + plan + tutor;
      }
      case "writer":
        return 0; // tracked separately via writer service logs
      default:
        return 0;
    }
  } catch (err) {
    console.error(`[QuotaMiddleware] Error counting ${featureType} for user ${userId}:`, err.message);
    return 0; // fail open to not block user on DB error
  }
}

/**
 * Get comprehensive quota status for a user — used by /api/users/quota-status endpoint
 */
async function getUserQuotaStatus(userId) {
  const user = await User.findById(userId).select("name email membership");
  if (!user) throw new Error("User not found");

  const planId = getUserPlanId(user);
  const planConfig = PLAN_QUOTAS[planId] || PLAN_QUOTAS.free;
  const startDate = getPeriodStartDate(planId, user.membership);

  const isUnlimited = (limit) => limit >= 999999;

  const [notesCount, presentationsCount, quizzesCount, flashcardsCount, diagramsCount, studyCount] =
    await Promise.all([
      getFeatureUsageCount(userId, "notes",         startDate, planConfig.notes),
      getFeatureUsageCount(userId, "presentations", startDate, planConfig.presentations),
      getFeatureUsageCount(userId, "quizzes",       startDate, planConfig.quizzes),
      getFeatureUsageCount(userId, "flashcards",    startDate, planConfig.flashcards),
      getFeatureUsageCount(userId, "diagrams",      startDate, planConfig.diagrams),
      getFeatureUsageCount(userId, "study",         startDate, planConfig.study),
    ]);

  const buildFeature = (used, limit, label) => ({
    used: isUnlimited(limit) ? 0 : used,
    limit: isUnlimited(limit) ? -1 : limit,           // -1 = unlimited (for frontend)
    remaining: isUnlimited(limit) ? -1 : Math.max(0, limit - used),
    unlimited: isUnlimited(limit),
    label,
  });

  return {
    planId,
    planName: planConfig.name,
    planDisplayName: planConfig.planDisplayName,
    period: planConfig.period,
    periodStart: startDate,
    maxVideoLengthMin: planConfig.maxVideoLengthMin,
    maxSlides: planConfig.maxSlides,
    paperChatMessages: planConfig.paperChatMessages,
    features: {
      notes:         buildFeature(notesCount,         planConfig.notes,         "AI Video Notes"),
      presentations: buildFeature(presentationsCount, planConfig.presentations, "AI Slide Decks"),
      quizzes:       buildFeature(quizzesCount,       planConfig.quizzes,       "AI Quiz Sets"),
      flashcards:    buildFeature(flashcardsCount,    planConfig.flashcards,    "Flashcard Sets"),
      diagrams:      buildFeature(diagramsCount,      planConfig.diagrams,      "Mind Maps"),
      study:         buildFeature(studyCount,         planConfig.study,         "Math & Study Solves"),
    },
  };
}

/**
 * Express middleware — enforces plan quotas before any AI generation route.
 * Usage: router.post("/generate", enforceQuota("notes"), handler)
 */
function enforceQuota(featureType) {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required to generate content",
        });
      }

      const user = await User.findById(userId).select("membership name email");
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const planId = getUserPlanId(user);
      const planConfig = PLAN_QUOTAS[planId] || PLAN_QUOTAS.free;
      const limit = planConfig[featureType];

      // Skip quota check for unlimited features
      if (limit === undefined || limit === null || limit >= 999999) {
        req.quota = { planId, planName: planConfig.name, unlimited: true };
        return next();
      }

      const startDate = getPeriodStartDate(planId, user.membership);
      const usedCount = await getFeatureUsageCount(userId, featureType, startDate, limit);

      if (usedCount >= limit) {
        const isFree = planId === "free";
        const periodWord = isFree ? "today" : "this month";
        const upgradeTarget = isFree
          ? "Pro Scholar ($9.99/mo) for 120 monthly notes, 10 PPTs, 30 quizzes & more"
          : "Power Scholar ($19.99/mo) for 350 monthly notes, unlimited quizzes & 8-hour videos";

        return res.status(403).json({
          success: false,
          code: "QUOTA_EXCEEDED",
          message: `You've used all ${limit} ${featureType} for ${periodWord} on the ${planConfig.name} plan. Upgrade to ${upgradeTarget}.`,
          feature: featureType,
          used: usedCount,
          limit,
          plan: planConfig.name,
          planId,
          period: planConfig.period,
          upgradeUrl: "/pricing",
        });
      }

      // Attach quota info to request for downstream logging
      req.quota = {
        planId,
        planName: planConfig.name,
        used: usedCount,
        limit,
        remaining: limit - usedCount - 1,
        unlimited: false,
      };

      next();
    } catch (error) {
      console.error(`[QuotaMiddleware] Quota check failed for ${featureType}:`, error.message);
      // Fail open on unexpected internal error — do not block user generation
      next();
    }
  };
}

/**
 * Middleware to enforce video length limit before note generation.
 * Expects req.body.videoDurationMin (number) to be set by route handler.
 */
function enforceVideoLength(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId) return next();

    // Duration must be set by upstream parser
    const durationMin = Number(req.body.videoDurationMin || req.body.durationMin || 0);
    if (!durationMin) return next(); // no duration info, allow and let AI fail gracefully

    const user = req.user;
    const planId = getUserPlanId(user);
    const planConfig = PLAN_QUOTAS[planId] || PLAN_QUOTAS.free;
    const maxMin = planConfig.maxVideoLengthMin;

    if (durationMin > maxMin) {
      const upgradeMsg = planId === "free"
        ? "Upgrade to Pro Scholar to process videos up to 4 hours long."
        : "Upgrade to Power Scholar to process videos up to 8 hours long.";

      return res.status(403).json({
        success: false,
        code: "VIDEO_TOO_LONG",
        message: `Your ${planConfig.name} plan supports videos up to ${maxMin} minutes (${maxMin >= 60 ? Math.round(maxMin / 60) + " hrs" : maxMin + " min"}). This video is ${Math.round(durationMin)} minutes. ${upgradeMsg}`,
        maxAllowedMin: maxMin,
        videoDurationMin: durationMin,
        plan: planConfig.name,
        upgradeUrl: "/pricing",
      });
    }

    next();
  } catch (err) {
    console.error("[QuotaMiddleware] Video length check error:", err.message);
    next(); // fail open
  }
}

module.exports = {
  PLAN_QUOTAS,
  PLAN_PRICING,
  getUserPlanId,
  getPeriodStartDate,
  getUserQuotaStatus,
  enforceQuota,
  enforceVideoLength,
};
