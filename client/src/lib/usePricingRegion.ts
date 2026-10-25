"use client";

/**
 * usePricingRegion — Server-authoritative region detection for pricing.
 *
 * Resolution order (highest authority first):
 *   1. Server IP-based detection:  GET /api/general/pricing-region
 *      → Returns { region: "IN" | "GLOBAL", country: string, currency: string }
 *      → This is the authoritative signal — immune to VPN/timezone manipulation
 *   2. Browser timezone fallback (only used if server call fails in dev/offline)
 *      → Asia/Calcutta or Asia/Kolkata → "IN"
 *
 * The checkout itself always uses the server-side region stored against the user's session —
 * so even if a frontend user somehow changes the displayed currency, the server will
 * charge the correct amount for the correct region at payment time.
 */

import { useState, useEffect } from "react";
import { getPricingConfig, type PricingConfig, type PricingRegion } from "./pricingConfig";
import api from "@/config/api";

export interface PricingRegionResult {
  /** The resolved pricing config (IN or GLOBAL) */
  pricingConfig: PricingConfig;
  /** Raw region ID */
  region: PricingRegion;
  /** ISO country code e.g. "IN", "US" — from server */
  country: string | null;
  /** Whether region detection is still loading */
  loading: boolean;
  /** Whether region came from authoritative server (true) or timezone fallback (false) */
  authoritative: boolean;
}

/** Timezone-based fallback — used only when server is unreachable */
function detectRegionFromTimezone(): PricingRegion {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Calcutta" || tz === "Asia/Kolkata") return "IN";
  } catch {}
  return "GLOBAL";
}

export function usePricingRegion(): PricingRegionResult {
  // Temporarily force GLOBAL region on the frontend so both India and Global show the exact same pricing
  return {
    pricingConfig: getPricingConfig("GLOBAL"),
    region: "GLOBAL",
    country: "GLOBAL",
    loading: false,
    authoritative: true,
  };
}
