// services/tokenResetService.js
const User = require("../models/User");
const cron = require("node-cron");

class TokenResetService {
  constructor() {
    this.dailyResetJob = null;
    this.subscriptionCheckJob = null;
  }

  /**
   * Start all cron jobs
   */
  startDailyReset() {
    // Run daily at midnight (00:00)
    this.dailyResetJob = cron.schedule("0 0 * * *", async () => {
      console.log("🔄 Running daily token reset for free users...");
      await this.resetFreeUserTokens();
    });

    // Check for expired subscriptions every hour
    this.subscriptionCheckJob = cron.schedule("0 * * * *", async () => {
      console.log("🔄 Checking for expired subscriptions...");
      await this.handleExpiredSubscriptions();
    });

    console.log("✅ Token reset service started");
  }

  /**
   * Reset tokens for free users who used tokens yesterday
   */
  async resetFreeUserTokens() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all free users (non-premium)
      const freeUsers = await User.find({ 
        'membership.isActive': false 
      });

      console.log(`📊 Found ${freeUsers.length} free users to check`);

      let resetCount = 0;
      let skippedCount = 0;

      for (const user of freeUsers) {
        // Check if user used tokens yesterday
        const usedTokensYesterday = user.tokenUsageHistory?.some(usage => {
          const usageDate = new Date(usage.date);
          return usageDate >= yesterday && usageDate < today;
        });

        if (usedTokensYesterday) {
          // User used tokens yesterday, reset to 5
          user.tokens = 5;
          user.lastTokenReset = new Date();
          await user.save();
          resetCount++;
          console.log(`✅ Reset tokens for user: ${user.email} (used tokens yesterday)`);
        } else {
          // User didn't use tokens yesterday, keep current tokens
          console.log(`⏭️ Skipped user: ${user.email} (no token usage yesterday)`);
          skippedCount++;
        }
      }

      console.log(`📊 Daily token reset complete - Reset: ${resetCount}, Skipped: ${skippedCount}`);
      
      // Log summary
      if (resetCount > 0 || skippedCount > 0) {
        console.log(`📈 Summary: ${resetCount} users got 5 tokens, ${skippedCount} users kept their tokens`);
      }

    } catch (error) {
      console.error("❌ Error in daily token reset:", error);
    }
  }

  /**
   * Handle expired subscriptions
   * Convert expired premium users back to free users with 5 tokens
   */
  async handleExpiredSubscriptions() {
    try {
      const now = new Date();

      // Find users with expired subscriptions
      const expiredUsers = await User.find({
        'membership.isActive': true,
        'membership.expiresAt': { $lt: now }
      });

      console.log(`📊 Found ${expiredUsers.length} users with expired subscriptions`);

      let convertedCount = 0;

      for (const user of expiredUsers) {
        // Convert to free user
        user.membership.isActive = false;
        user.membership.planName = 'Free';
        user.membership.billingPeriod = undefined;
        user.membership.expiresAt = undefined;
        
        // Reset tokens to free user limit (5)
        user.tokens = 5;
        user.lastTokenReset = new Date();
        
        // Add to token usage history for tracking
        user.tokenUsageHistory.push({
          name: 'Subscription expired - converted to free',
          tokens: 0,
          date: new Date()
        });

        await user.save();
        convertedCount++;
        
        console.log(`✅ Converted expired premium user to free: ${user.email}`);
        console.log(`   - Previous plan: ${user.membership.planName}`);
        console.log(`   - Tokens reset to: 5`);
      }

      if (convertedCount > 0) {
        console.log(`📊 Subscription check complete - Converted ${convertedCount} expired users to free`);
      }

    } catch (error) {
      console.error("❌ Error handling expired subscriptions:", error);
    }
  }

  /**
   * Manually reset tokens for a specific user
   * @param {string} userId - User ID
   */
  async manualResetForUser(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error("User not found");
      }

      // Check if user is premium
      if (user.membership?.isActive) {
        console.log(`⏭️ User ${user.email} is premium, skipping token reset`);
        return {
          success: false,
          message: "Premium users don't need token resets"
        };
      }

      // Reset to 5 tokens
      user.tokens = 5;
      user.lastTokenReset = new Date();
      
      await user.save();

      console.log(`✅ Manually reset tokens for user: ${user.email}`);
      
      return {
        success: true,
        message: "Tokens reset successfully",
        user: {
          email: user.email,
          tokens: user.tokens
        }
      };

    } catch (error) {
      console.error("❌ Error in manual reset:", error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get token reset statistics
   */
  async getResetStats() {
    try {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Users who used tokens yesterday
      const usersWhoUsedTokens = await User.find({
        'membership.isActive': false,
        tokenUsageHistory: {
          $elemMatch: {
            date: { $gte: yesterday, $lt: today }
          }
        }
      });

      // Total free users
      const totalFreeUsers = await User.countDocuments({
        'membership.isActive': false
      });

      // Total premium users
      const totalPremiumUsers = await User.countDocuments({
        'membership.isActive': true
      });

      // Users with expiring soon (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const expiringSoon = await User.countDocuments({
        'membership.isActive': true,
        'membership.expiresAt': { 
          $gte: now, 
          $lte: nextWeek 
        }
      });

      return {
        success: true,
        stats: {
          totalFreeUsers,
          totalPremiumUsers,
          usersToResetToday: usersWhoUsedTokens.length,
          expiringSubscriptions: expiringSoon,
          lastCheck: new Date()
        }
      };

    } catch (error) {
      console.error("❌ Error getting reset stats:", error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Stop all cron jobs
   */
  stopAllJobs() {
    if (this.dailyResetJob) {
      this.dailyResetJob.stop();
    }
    if (this.subscriptionCheckJob) {
      this.subscriptionCheckJob.stop();
    }
    console.log("🛑 Token reset service stopped");
  }

  /**
   * Test function to run reset manually (for testing)
   */
  async testReset() {
    console.log("🧪 Running test token reset...");
    await this.resetFreeUserTokens();
    await this.handleExpiredSubscriptions();
  }
}

module.exports = new TokenResetService();