// pricing.js — Central source of truth for subscription plans and pricing
const PLANS = {
  pro: {
    name: "Pro Scholar",
    monthly: { priceUSD: 9.99, priceINR: 799, durationDays: 30 },
    yearly:  { priceUSD: 79.99, priceINR: 6999, durationDays: 365 },
  },
  power: {
    name: "Power Scholar",
    monthly: { priceUSD: 19.99, priceINR: 1599, durationDays: 30 },
    yearly:  { priceUSD: 149.99, priceINR: 12999, durationDays: 365 },
  },
};

/**
 * Returns the base price for a given plan, billing period, and currency.
 * @param {string} planId - "pro" | "power"
 * @param {string} billingPeriod - "monthly" | "yearly"
 * @param {string} currency - "INR" | "USD"
 * @returns {number|null}
 */
function getPlanPrice(planId, billingPeriod = "monthly", currency = "INR") {
  const normPlan = String(planId || "pro").toLowerCase();
  const plan = PLANS[normPlan];
  if (!plan) return null;

  const normBilling = String(billingPeriod || "monthly").toLowerCase() === "yearly" ? "yearly" : "monthly";
  const period = plan[normBilling];
  if (!period) return null;

  const normCurrency = String(currency || "INR").toUpperCase();
  if (normCurrency === "USD") {
    return period.priceUSD;
  }
  return period.priceINR;
}

module.exports = { PLANS, getPlanPrice };

