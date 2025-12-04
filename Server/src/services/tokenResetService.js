const User = require("../models/User");
const cron = require("node-cron");

class TokenResetService {
  constructor() {
    this.isRunning = false;
  }

  async resetDailyTokens() {
    try {
      console.log(`[${new Date().toISOString()}] Starting daily token reset...`);
      
      const result = await User.updateMany(
        {
          // Reset tokens for all users except those with active subscriptions
          $or: [
            { 'membership.isActive': false },
            { 'membership.isActive': { $exists: false } }
          ]
        },
        {
          $set: { 
            token: 50,
            usedToken: 0
          },
          $push: {
            tokenTransactions: {
              name: "Daily Token Reset",
              type: "daily_reset",
              tokensUsed: 0,
              status: "success"
            }
          }
        }
      );

      const count = result.modifiedCount;
      console.log(`[${new Date().toISOString()}] Tokens reset for ${count} users`);
      
      return count;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error resetting tokens:`, error.message);
      throw error;
    }
  }

  // Special reset for new users (first day 100 tokens)
  async initializeNewUser(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        $set: { 
          token: 100,
          usedToken: 0
        },
        $push: {
          tokenTransactions: {
            name: "Welcome Tokens",
            type: "welcome_bonus",
            tokensUsed: 0,
            status: "success"
          }
        }
      });
      
      console.log(`[${new Date().toISOString()}] Welcome tokens set for user: ${userId}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error initializing user tokens:`, error.message);
      throw error;
    }
  }

  startDailyReset() {
    if (this.isRunning) {
      console.log("Token reset scheduler is already running");
      return;
    }

    // Schedule to run every day at 00:05 AM
    cron.schedule('5 0 * * *', async () => {
      try {
        await this.resetDailyTokens();
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Scheduled token reset failed:`, error.message);
      }
    }, {
      timezone: "Asia/Kolkata" // Adjust timezone as needed
    });

    this.isRunning = true;
    console.log(`[${new Date().toISOString()}] Daily token reset scheduler started (runs at 00:05 every day)`);
  }

  // Manual trigger for testing
  async manualReset() {
    return await this.resetDailyTokens();
  }
}

module.exports = new TokenResetService();