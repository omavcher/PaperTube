const User = require("../models/User");

const isMembershipActive = (membership) => {
  if (!membership || !membership.isActive || !membership.expiresAt) {
    return false;
  }
  return new Date(membership.expiresAt) > new Date();
};

const refreshMembershipFlagIfExpired = async (user) => {
  if (!user.membership) return false;
  const stillActive = isMembershipActive(user.membership);
  if (!stillActive && user.membership.isActive) {
    user.membership.isActive = false;
    await user.save({ validateBeforeSave: false });
  }
  return stillActive;
};

const requireSubscriptionOrTokens = ({
  tokenCost = 0,
  actionLabel = "perform this action",
} = {}) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const user = await User.findById(userId).select(
        "name email token usedToken membership notes picture"
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const hasActiveMembership =
        (await refreshMembershipFlagIfExpired(user)) ||
        isMembershipActive(user.membership);

      if (!hasActiveMembership && tokenCost > 0 && user.token < tokenCost) {
        return res.status(403).json({
          success: false,
          code: "INSUFFICIENT_TOKENS",
          message: `You need ${tokenCost} tokens to ${actionLabel}.`,
          requiredTokens: tokenCost,
          availableTokens: user.token,
        });
      }

      req.accessControl = {
        ...(req.accessControl || {}),
        userDoc: user,
        hasActiveMembership,
        tokenCostRequired: hasActiveMembership ? 0 : tokenCost,
        actionLabel,
      };

      next();
    } catch (error) {
      console.error("❌ Access control error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify subscription/token access",
        error: error.message,
      });
    }
  };
};

const requireActiveSubscription = (message = "An active subscription is required") => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const user = await User.findById(userId).select("membership");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const active = isMembershipActive(user.membership);
      if (!active) {
        return res.status(403).json({
          success: false,
          code: "SUBSCRIPTION_REQUIRED",
          message,
        });
      }

      req.accessControl = {
        ...(req.accessControl || {}),
        userDoc: user,
        hasActiveMembership: true,
      };
      next();
    } catch (error) {
      console.error("❌ Subscription middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify subscription",
        error: error.message,
      });
    }
  };
};

module.exports = {
  requireSubscriptionOrTokens,
  requireActiveSubscription,
  isMembershipActive,
};

