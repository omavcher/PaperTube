// ─── Pricing Region Config ────────────────────────────────────────────────────
// Single source of truth for all pricing numbers (mirrored from quotaMiddleware.js PLAN_PRICING)
// India:   Free ₹0 | Pro ₹799/mo ₹6,999/yr | Power ₹1,599/mo ₹12,999/yr
// Global:  Free $0 | Pro $9.99/mo $79.99/yr | Power $19.99/mo $149.99/yr
// ─────────────────────────────────────────────────────────────────────────────

export type PricingRegion = "IN" | "GLOBAL";

export interface PlanPricing {
  monthly: number;
  yearly: number;
  /** monthly equivalent when billed yearly */
  yearlyPerMonth: number;
  /** e.g. "Save 33%" — computed server-side so it matches the actual numbers */
  yearlySavingPct: number;
}

export interface PricingConfig {
  region: PricingRegion;
  /** ISO 4217 currency code */
  currency: "INR" | "USD";
  /** Display symbol */
  symbol: "₹" | "$";
  /** How to format a number for this currency (no symbol) */
  format: (n: number) => string;
  plans: {
    pro: PlanPricing;
    power: PlanPricing;
  };
}

// ─── Static config tables ─────────────────────────────────────────────────────
function savePct(monthly: number, yearly: number): number {
  const full = monthly * 12;
  return full > 0 ? Math.round(((full - yearly) / full) * 100) : 0;
}

const INDIA_CONFIG: PricingConfig = {
  region: "IN",
  currency: "INR",
  symbol: "₹",
  format: (n) => n.toLocaleString("en-IN"),
  plans: {
    pro: {
      monthly: 799,
      yearly: 6999,
      yearlyPerMonth: 583,
      yearlySavingPct: savePct(799, 6999),
    },
    power: {
      monthly: 1599,
      yearly: 12999,
      yearlyPerMonth: 1083,
      yearlySavingPct: savePct(1599, 12999),
    },
  },
};

const GLOBAL_CONFIG: PricingConfig = {
  region: "GLOBAL",
  currency: "USD",
  symbol: "$",
  format: (n) => n.toFixed(2),
  plans: {
    pro: {
      monthly: 9.99,
      yearly: 79.99,
      yearlyPerMonth: 6.67,
      yearlySavingPct: savePct(9.99, 79.99),
    },
    power: {
      monthly: 19.99,
      yearly: 149.99,
      yearlyPerMonth: 10.83,
      yearlySavingPct: savePct(19.99, 149.99),
    },
  },
};

export function getPricingConfig(region: PricingRegion): PricingConfig {
  return region === "IN" ? INDIA_CONFIG : GLOBAL_CONFIG;
}

/** Max yearly saving % across all plans — used for the "Save up to X%" pill */
export function getMaxYearlySaving(config: PricingConfig): number {
  return Math.max(config.plans.pro.yearlySavingPct, config.plans.power.yearlySavingPct);
}
