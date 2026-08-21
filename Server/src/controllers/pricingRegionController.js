// controllers/pricingRegionController.js
// Authoritative server-side pricing region detection via IP geolocation.
// Runs entirely on the server — immune to client timezone/VPN manipulation.

const axios = require("axios");

// Simple in-memory cache to avoid hitting ipapi.co on every page load.
// Key: IP string, Value: { country, region, cachedAt }
// TTL: 6 hours per IP (country rarely changes mid-session)
const GEO_CACHE = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Resolve the real client IP from common proxy headers.
 * Priority: Cloudflare > X-Forwarded-For > socket remote address
 */
function resolveClientIp(req) {
  // Cloudflare sets this header with the real client IP
  const cf = req.headers["cf-connecting-ip"];
  if (cf) return cf.trim();

  // Standard reverse-proxy header (may be comma-separated list)
  const xff = req.headers["x-forwarded-for"];
  if (xff) return xff.split(",")[0].trim();

  // Direct connection fallback
  return req.socket?.remoteAddress || "127.0.0.1";
}

/**
 * Classify a country code into a Paperxify pricing region.
 *   "IN" → India → show INR pricing + Razorpay
 *   "GLOBAL" → everywhere else → show USD pricing + PayPal/LemonSqueezy
 */
function classifyRegion(countryCode) {
  if (!countryCode) return "GLOBAL";
  return countryCode.toUpperCase() === "IN" ? "IN" : "GLOBAL";
}

/**
 * Look up country code for an IP using ipapi.co (free, 1k req/day, no key required).
 * Falls back gracefully to "GLOBAL" on any error.
 *
 * Production note: For > 1k daily unique visitors, replace with:
 *   - ip-api.com Pro ($15/mo, 45k req/min)
 *   - MaxMind GeoLite2 (self-hosted, no rate limit)
 *   - Cloudflare Workers KV (if behind CF, use req.cf.country directly for free)
 */
async function lookupCountry(ip) {
  // Localhost / private IP → treat as India for local dev convenience
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.")
  ) {
    return { country: "IN", source: "localhost-dev-default" };
  }

  // Check cache first
  const cached = GEO_CACHE.get(ip);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return { country: cached.country, source: "cache" };
  }

  try {
    // ipapi.co returns JSON: { country_code: "IN", ... }
    const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: 3000,
      headers: { "User-Agent": "Paperxify/1.0 (pricing-region)" },
    });

    const countryCode = response.data?.country_code || null;

    // Cache the result
    GEO_CACHE.set(ip, { country: countryCode, cachedAt: Date.now() });

    // Cleanup stale cache entries periodically
    if (GEO_CACHE.size > 5000) {
      const now = Date.now();
      for (const [key, val] of GEO_CACHE.entries()) {
        if (now - val.cachedAt > CACHE_TTL_MS) GEO_CACHE.delete(key);
      }
    }

    return { country: countryCode, source: "ipapi.co" };
  } catch (err) {
    console.warn(`[PricingRegion] IP lookup failed for ${ip}: ${err.message}`);
    return { country: null, source: "error-fallback" };
  }
}

/**
 * GET /api/general/pricing-region
 *
 * Response:
 * {
 *   success: true,
 *   region: "IN" | "GLOBAL",
 *   country: "IN" | "US" | ...,   // ISO 3166-1 alpha-2
 *   currency: "INR" | "USD",
 *   symbol: "₹" | "$",
 *   source: "ipapi.co" | "cache" | "localhost-dev-default" | "error-fallback"
 * }
 */
module.exports = async function pricingRegionController(req, res) {
  try {
    const ip = resolveClientIp(req);
    const { country, source } = await lookupCountry(ip);
    const region = classifyRegion(country);

    return res.json({
      success: true,
      region,
      country: country || "UNKNOWN",
      currency: region === "IN" ? "INR" : "USD",
      symbol: region === "IN" ? "₹" : "$",
      source,
    });
  } catch (err) {
    console.error("[PricingRegion] Unexpected error:", err.message);
    // Fail open — return GLOBAL so users can still see pricing
    return res.json({
      success: true,
      region: "GLOBAL",
      country: "UNKNOWN",
      currency: "USD",
      symbol: "$",
      source: "error-fallback",
    });
  }
};
