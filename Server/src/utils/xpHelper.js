const User = require("../models/User");

/**
 * Award XP to a user and save their profile (recalculating rank automatically).
 * @param {string} userId - The user's MongoDB ID
 * @param {number} amount - The amount of XP to award
 */
exports.awardXP = async (userId, amount) => {
  try {
    if (!userId) return;
    const user = await User.findById(userId);
    if (!user) return;

    user.xp = (user.xp || 0) + amount;
    
    // Recalculate rank based on XP score
    if (user.xp >= 1500) {
      user.rank = "legendary";
    } else if (user.xp >= 500) {
      user.rank = "master";
    } else {
      user.rank = "basic";
    }

    await user.save({ validateBeforeSave: false });
    console.log(`🏆 [XPHelper] Awarded ${amount} XP to user ${user.email}. New XP: ${user.xp}, Rank: ${user.rank}`);
    return { xp: user.xp, rank: user.rank };
  } catch (error) {
    console.error("❌ [XPHelper] Error awarding XP:", error);
  }
};
