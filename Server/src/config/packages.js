const subscriptionPlans = {
  "scholar-plan": {
    name: "Scholar",
    billing: {
      monthly: { price: 149, durationDays: 30 },
      yearly: { price: 1490, durationDays: 365 },
    },
    tokensIncluded: 0,
  },
  "pro-scholar-plan": {
    name: "Pro Scholar",
    billing: {
      monthly: { price: 299, durationDays: 30 },
      yearly: { price: 2990, durationDays: 365 },
    },
    tokensIncluded: 0,
  },
  "power-institute-plan": {
    name: "Power Institute",
    billing: {
      monthly: { price: 599, durationDays: 30 },
      yearly: { price: 5990, durationDays: 365 },
    },
    tokensIncluded: 0,
  },
};

const tokenPackages = {
  "micro-pack": { name: "Micro Study Pack", price: 99, tokens: 500 },
  "revision-bundle": { name: "Revision Bundle", price: 249, tokens: 1500 },
  "expert-pack": { name: "Expert Pack", price: 499, tokens: 3500 },
  "master-pack": { name: "Master Pack", price: 899, tokens: 7000 },
};

const GST_RATE = 0.18;

const getSubscriptionPlan = (planId, billingPeriod = "monthly") => {
  const plan = subscriptionPlans[planId];
  if (!plan) {
    return null;
  }

  const billingDetails = plan.billing[billingPeriod];
  if (!billingDetails) {
    return null;
  }

  return {
    planId,
    name: plan.name,
    billingPeriod,
    basePrice: billingDetails.price,
    durationDays: billingDetails.durationDays,
    tokensIncluded: plan.tokensIncluded || 0,
  };
};

const getTokenPackage = (packageId) => {
  const pkg = tokenPackages[packageId];
  if (!pkg) {
    return null;
  }

  return {
    packageId,
    name: pkg.name,
    tokens: pkg.tokens,
    basePrice: pkg.price,
  };
};

module.exports = {
  GST_RATE,
  subscriptionPlans,
  tokenPackages,
  getSubscriptionPlan,
  getTokenPackage,
};

