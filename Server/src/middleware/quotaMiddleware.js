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

// ─── Calibrated Quotas Ensuring 70%+ Net Profit Margin ─────────────────────────
const PLAN_QUOTAS = {
  free: {
    name: "Free",
    period: "daily",
    notes: 3,           // 3 video notes / day
    presentations: 2,   // 2 PPT decks / day
    quizzes: 5,         // 5 quizzes / day
    flashcards: 5,      // 5 flashcard sets / day
    diagrams: 5,        // 5 mind maps / diagrams / day
    study: 5,           // 5 homework/math/planner/tutor solves / day
    writer: 2,          // 2 humanizer/essay runs / day
    maxVideoLengthMin: 45,
    maxSlides: 8,
  },
  pro: {
    name: "Pro Scholar",
    period: "monthly",
    notes: 120,         // 120 notes / month (~4/day)
    presentations: 60,  // 60 PPT decks / month (~2/day)
    quizzes: 250,       // 250 quizzes / month
    flashcards: 250,    // 250 flashcard sets / month
    diagrams: 250,      // 250 diagrams / month
    study: 500,         // 500 study solves / month
    writer: 50,         // 50 humanizer/essay runs / month
    maxVideoLengthMin: 240, // 4 hours
    maxSlides: 20,
  },
  power: {
    name: "Power Scholar",
    period: "monthly",
    notes: 350,         // 350 notes / month (~12/day)
    presentations: 180, // 180 PPT decks / month (~6/day)
    quizzes: 800,       // 800 quizzes / month
    flashcards: 800,    // 800 flashcard sets / month
    diagrams: 800,      // 800 diagrams / month
    study: 1500,        // 1,500 study solves / month
    writer: 200,        // 200 humanizer/plagiarism runs / month
    maxVideoLengthMin: 720, // 12 hours
    maxSlides: 40,
  }
};

/**
 * Determine the user's active plan ID ('free', 'pro', 'power')
 */
function getUserPlanId(user) {
  if (!user || !user.membership || !user.membership.isActive) return "free";
  const expiresAt = user.membership.expiresAt ? new Date(user.membership.expiresAt) : null;
  if (!expiresAt || expiresAt <= new Date()) return "free";
  
  const planId = String(user.membership.planId || "").toLowerCase();
  if (planId.includes("power")) return "power";
  if (planId.includes("pro")) return "pro";
  return "pro"; // default active paid
}

/**
 * Calculate the period start date (today 00:00 for free, 30 days ago/billing cycle for pro/power)
 */
function getPeriodStartDate(planId, membership) {
  if (planId === "free") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
  // For monthly plans, take the startedAt or 30 days back
  if (membership && membership.startedAt) {
    const started = new Date(membership.startedAt);
    const now = new Date();
    // find the most recent monthly cycle boundary
    const cycleMs = 30 * 24 * 60 * 60 * 1000;
    const diff = now.getTime() - started.getTime();
    if (diff > 0) {
      const cyclesPassed = Math.floor(diff / cycleMs);
      return new Date(started.getTime() + cyclesPassed * cycleMs);
    }
  }
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return thirtyDaysAgo;
}

/**
 * Fetch current usage count for a specific feature
 */
async function getFeatureUsageCount(userId, featureType, startDate) {
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
        return 0; // writer tracking if tracked in logs
      default:
        return 0;
    }
  } catch (err) {
    console.error(`Error counting usage for ${featureType}:`, err.message);
    return 0;
  }
}

/**
 * Get comprehensive quota status for a user
 */
async function getUserQuotaStatus(userId) {
  const user = await User.findById(userId).select("name email membership");
  if (!user) throw new Error("User not found");

  const planId = getUserPlanId(user);
  const planConfig = PLAN_QUOTAS[planId] || PLAN_QUOTAS.free;
  const startDate = getPeriodStartDate(planId, user.membership);

  const [notesCount, presentationsCount, quizzesCount, flashcardsCount, diagramsCount, studyCount] =
    await Promise.all([
      getFeatureUsageCount(userId, "notes", startDate),
      getFeatureUsageCount(userId, "presentations", startDate),
      getFeatureUsageCount(userId, "quizzes", startDate),
      getFeatureUsageCount(userId, "flashcards", startDate),
      getFeatureUsageCount(userId, "diagrams", startDate),
      getFeatureUsageCount(userId, "study", startDate),
    ]);

  return {
    planId,
    planName: planConfig.name,
    period: planConfig.period,
    periodStart: startDate,
    features: {
      notes: {
        used: notesCount,
        limit: planConfig.notes,
        remaining: Math.max(0, planConfig.notes - notesCount),
      },
      presentations: {
        used: presentationsCount,
        limit: planConfig.presentations,
        remaining: Math.max(0, planConfig.presentations - presentationsCount),
      },
      quizzes: {
        used: quizzesCount,
        limit: planConfig.quizzes,
        remaining: Math.max(0, planConfig.quizzes - quizzesCount),
      },
      flashcards: {
        used: flashcardsCount,
        limit: planConfig.flashcards,
        remaining: Math.max(0, planConfig.flashcards - flashcardsCount),
      },
      diagrams: {
        used: diagramsCount,
        limit: planConfig.diagrams,
        remaining: Math.max(0, planConfig.diagrams - diagramsCount),
      },
      study: {
        used: studyCount,
        limit: planConfig.study,
        remaining: Math.max(0, planConfig.study - studyCount),
      },
    },
  };
}

/**
 * Express middleware to strictly enforce plan quotas before generation
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

      if (limit !== undefined && limit !== null) {
        const startDate = getPeriodStartDate(planId, user.membership);
        const usedCount = await getFeatureUsageCount(userId, featureType, startDate);

        if (usedCount >= limit) {
          const isFree = planId === "free";
          const periodWord = isFree ? "today" : "this billing cycle";
          const upgradeSuggestion = isFree ? "Pro Scholar for 120 monthly notes" : "Power Scholar for 350 monthly notes";

          return res.status(403).json({
            success: false,
            code: "QUOTA_EXCEEDED",
            message: `You have reached your ${planConfig.name} plan limit of ${limit} ${featureType} ${periodWord}. Upgrade to ${upgradeSuggestion} to keep creating.`,
            feature: featureType,
            used: usedCount,
            limit: limit,
            plan: planConfig.name,
            period: planConfig.period,
          });
        }

        // Attach quota info to request
        req.quota = {
          planId,
          planName: planConfig.name,
          used: usedCount,
          limit,
          remaining: limit - usedCount - 1,
        };
      }

      next();
    } catch (error) {
      console.error(`Quota check failed for ${featureType}:`, error);
      // Fail open on unexpected error so user isn't blocked by internal error
      next();
    }
  };
}

module.exports = {
  PLAN_QUOTAS,
  getUserPlanId,
  getUserQuotaStatus,
  enforceQuota,
};
