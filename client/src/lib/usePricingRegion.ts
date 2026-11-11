"use client";

/**
 * usePricingRegion — Server-authoritative region detection for pricing.
 *
 * Resolution order (highest authority first):
 *   1. Manual user preference (localStorage: "paperxify_pricing_region")
 *   2. Server IP-based detection: GET /api/general/pricing-region
 *      → Returns { region: "IN" | "GLOBAL", country: string, currency: string }
 *   3. Browser timezone / locale fallback (immediate synchronous default):
 *      → Asia/Calcutta, Asia/Kolkata, or Indian locales → "IN"
 *      → Otherwise → "GLOBAL"
 */

import { useState, useEffect, useCallback } from "react";
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
  /** Manual toggle to switch between IN (INR) and GLOBAL (USD) */
  setRegion: (region: PricingRegion) => void;
}

/** Timezone & locale-based fallback — used for instant synchronous detection */
function detectRegionFromBrowser(): PricingRegion {
  if (typeof window === "undefined") return "IN";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (
      tz.includes("Calcutta") ||
      tz.includes("Kolkata") ||
      tz.includes("India") ||
      tz === "Asia/Colombo"
    ) {
      return "IN";
    }
    const navLangs = navigator.languages || [navigator.language];
    if (
      navLangs.some(
        (l) =>
          l &&
          (l.includes("-IN") ||
            l.startsWith("hi") ||
            l.startsWith("mr") ||
            l.startsWith("ta") ||
            l.startsWith("te"))
      )
    ) {
      return "IN";
    }
  } catch {}
  return "GLOBAL";
}

function getInitialRegion(): PricingRegion {
  if (typeof window === "undefined") return "IN";
  const browserRegion = detectRegionFromBrowser();
  // Indian users always get Indian INR pricing directly
  if (browserRegion === "IN") return "IN";
  try {
    const saved = localStorage.getItem("paperxify_pricing_region");
    if (saved === "IN" || saved === "GLOBAL") return saved;
  } catch {}
  return browserRegion;
}

export function usePricingRegion(): PricingRegionResult {
  const [region, setRegionState] = useState<PricingRegion>(getInitialRegion);
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authoritative, setAuthoritative] = useState<boolean>(false);

  const setRegion = useCallback((newRegion: PricingRegion) => {
    setRegionState(newRegion);
    try {
      localStorage.setItem("paperxify_pricing_region", newRegion);
      window.dispatchEvent(
        new CustomEvent("paperxify_region_changed", { detail: newRegion })
      );
    } catch {}
  }, []);

  useEffect(() => {
    const handleRegionChange = (e: any) => {
      const updated =
        e?.detail || localStorage.getItem("paperxify_pricing_region");
      if (updated === "IN" || updated === "GLOBAL") {
        setRegionState(updated);
      }
    };
    window.addEventListener("paperxify_region_changed", handleRegionChange);
    window.addEventListener("storage", handleRegionChange);

    // If browser is detected in India, enforce IN (Indian INR pricing)
    if (detectRegionFromBrowser() === "IN") {
      setRegionState("IN");
      setCountry("IN");
      setAuthoritative(true);
      setLoading(false);
      return () => {
        window.removeEventListener("paperxify_region_changed", handleRegionChange);
        window.removeEventListener("storage", handleRegionChange);
      };
    }

    // If user explicitly saved preference, keep it authoritative
    const savedPref = localStorage.getItem("paperxify_pricing_region");
    if (savedPref === "IN" || savedPref === "GLOBAL") {
      setRegionState(savedPref);
      setCountry(savedPref);
      setAuthoritative(true);
      setLoading(false);
      return () => {
        window.removeEventListener("paperxify_region_changed", handleRegionChange);
        window.removeEventListener("storage", handleRegionChange);
      };
    }

    // Call server to confirm authoritative GeoIP
    let isMounted = true;
    api
      .get("/general/pricing-region")
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data?.region) {
          const detected = res.data.region === "IN" ? "IN" : "GLOBAL";
          setRegionState(detected);
          setCountry(res.data.country || detected);
          setAuthoritative(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRegionState(detectRegionFromBrowser());
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      window.removeEventListener("paperxify_region_changed", handleRegionChange);
      window.removeEventListener("storage", handleRegionChange);
    };
  }, []);

  return {
    pricingConfig: getPricingConfig(region),
    region,
    country,
    loading,
    authoritative,
    setRegion,
  };
}
