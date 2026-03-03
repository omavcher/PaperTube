// services/tokenResetService.js
const User = require("../models/User");
const cron = require("node-cron");

// ── Constants ──────────────────────────────────────────────────
const FREE_DAILY_TOKENS = 10;  // tokens free users get every day at midnight

class TokenResetService {
  constructor() {
    this.dailyResetJob = null;
    this.subscriptionCheckJob = null;
  }

  /**
   * Start all cron jobs
   */
  startDailyReset() {
    // ── Run at midnight every day (00:00 IST = 18:30 UTC if needed, but use local) ──
    this.dailyResetJob = cron.schedule("0 0 * * *", async () => {
      console.log("🌙 Midnight cron: starting daily stack reset...");
      await this.grantDailyTokensToFreeUsers();
      await this.resetMissedStreaks();
    });

    // ── Check for expired subscriptions every hour ──
    this.subscriptionCheckJob = cron.schedule("0 * * * *", async () => {
      console.log("🔄 Hourly check: expired subscriptions...");
      await this.handleExpiredSubscriptions();
    });

    console.log("✅ Token reset service started");
  }

  /**
   * Grant FREE_DAILY_TOKENS to ALL free users at midnight.
   * This happens regardless of whether they used tokens yesterday.
   * Their `lastTokenReset` gate (in authController) prevents double-granting
   * within the same calendar day.
   */
  async grantDailyTokensToFreeUsers() {
    try {
      const now = new Date();
      console.log(`🎁 Granting ${FREE_DAILY_TOKENS} daily tokens to all free users...`);

      const result = await User.updateMany(
        { "membership.isActive": false },
        {
          $set: {
            tokens: FREE_DAILY_TOKENS,
            lastTokenReset: now,
          },
        }
      );

      console.log(`✅ Daily token grant complete — updated ${result.modifiedCount} free users.`);
    } catch (error) {
      console.error("❌ Error in grantDailyTokensToFreeUsers:", error);
    }
  }

  /**
   * At midnight, reset streak to 0 for any user whose lastVisit
   * was NOT today (they already logged in) — i.e. users who missed yesterday.
   * We check lastVisit < "yesterday" meaning they skipped at least one day.
   */
  async resetMissedStreaks() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      // Users whose last visit was before yesterday — streak should reset
      const result = await User.updateMany(
        {
          $or: [
            { "streak.lastVisit": { $lt: yesterday } },
            { "streak.lastVisit": { $exists: false } },
          ],
          "streak.count": { $gt: 0 },
        },
        {
          $set: { "streak.count": 0 },
        }
      );

      console.log(`🔄 Streak reset for ${result.modifiedCount} users who missed a day.`);
    } catch (error) {
      console.error("❌ Error in resetMissedStreaks:", error);
    }
  }

  /**
   * Handle expired subscriptions.
   * Converts expired premium users back to free with daily tokens.
   */
  async handleExpiredSubscriptions() {
    try {
      const now = new Date();

      const expiredUsers = await User.find({
        "membership.isActive": true,
        "membership.expiresAt": { $lt: now },
      });

      if (expiredUsers.length === 0) return;

      console.log(`📊 Found ${expiredUsers.length} users with expired subscriptions`);

      let convertedCount = 0;

      for (const user of expiredUsers) {
        user.membership.isActive = false;
        user.membership.planName = "Free";
        user.membership.billingPeriod = undefined;
        user.membership.expiresAt = undefined;

        // Grant them today's daily token allocation
        user.tokens = FREE_DAILY_TOKENS;
        user.lastTokenReset = now;

        // History entry
        user.tokenUsageHistory.push({
          name: "Subscription expired — converted to free plan",
          tokens: 0,
          date: now,
        });

        await user.save({ validateBeforeSave: false });
        convertedCount++;
        console.log(`✅ Expired subscription downgraded: ${user.email} → Free (${FREE_DAILY_TOKENS} tokens)`);
      }

      console.log(`📊 Subscription check complete — downgraded ${convertedCount} users.`);
    } catch (error) {
      console.error("❌ Error handling expired subscriptions:", error);
    }
  }

  /**
   * Manually reset tokens for a specific user (admin use).
   */
  async manualResetForUser(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) throw new Error("User not found");

      if (user.membership?.isActive) {
        return { success: false, message: "Premium users don't use the free daily token system" };
      }

      user.tokens = FREE_DAILY_TOKENS;
      user.lastTokenReset = new Date();
      await user.save({ validateBeforeSave: false });

      console.log(`✅ Manual token reset for: ${user.email}`);

      return {
        success: true,
        message: "Tokens reset successfully",
        user: { email: user.email, tokens: user.tokens },
      };
    } catch (error) {
      console.error("❌ Error in manualResetForUser:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get current daily stack stats (for admin dashboard).
   */
  async getResetStats() {
    try {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const totalFreeUsers = await User.countDocuments({ "membership.isActive": false });
      const totalPremiumUsers = await User.countDocuments({ "membership.isActive": true });

      // Users whose tokens were reset today
      const tokensGrantedToday = await User.countDocuments({
        "membership.isActive": false,
        lastTokenReset: { $gte: todayStart },
      });

      // Subscriptions expiring in next 7 days
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const expiringSoon = await User.countDocuments({
        "membership.isActive": true,
        "membership.expiresAt": { $gte: now, $lte: nextWeek },
      });

      // Active streaks (count > 0, lastVisit today)
      const activeStreaksToday = await User.countDocuments({
        "streak.count": { $gt: 0 },
        "streak.lastVisit": { $gte: todayStart },
      });

      return {
        success: true,
        stats: {
          totalFreeUsers,
          totalPremiumUsers,
          tokensGrantedToday,
          dailyTokenAllocation: FREE_DAILY_TOKENS,
          expiringSubscriptions: expiringSoon,
          activeStreaksToday,
          lastCheck: now,
        },
      };
    } catch (error) {
      console.error("❌ Error getting reset stats:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Stop all cron jobs gracefully.
   */
  stopAllJobs() {
    if (this.dailyResetJob) this.dailyResetJob.stop();
    if (this.subscriptionCheckJob) this.subscriptionCheckJob.stop();
    console.log("🛑 Token reset service stopped");
  }

  /**
   * Test: manually trigger all midnight jobs (dev only).
   */
  async testReset() {
    console.log("🧪 Running test daily stack reset...");
    await this.grantDailyTokensToFreeUsers();
    await this.resetMissedStreaks();
    await this.handleExpiredSubscriptions();
    console.log("🧪 Test complete.");
  }
}

module.exports = new TokenResetService();