// client/src/utils/analytics.ts

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Log a custom event to Google Analytics / Google Ads
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, params);
      console.log(`[Analytics] Tracked event: ${eventName}`, params);
    } catch (e) {
      console.error(`[Analytics] Failed to track event ${eventName}:`, e);
    }
  } else {
    console.log(`[Analytics - Mocked] Tracked event: ${eventName}`, params);
  }
}

/**
 * Track user signup (ads_conversion_signup)
 */
export function trackSignup(method: "email" | "google" | "github" | "google_onetap" | string) {
  trackEvent("ads_conversion_signup", {
    method,
  });
}

/**
 * Track subscription purchase (purchase_pro or purchase_power)
 */
export function trackPurchase(planId: "pro" | "power" | string, amount: number) {
  const eventName = planId === "power" ? "purchase_power" : "purchase_pro";
  trackEvent(eventName, {
    value: amount,
    currency: "USD",
    items: [
      {
        item_id: planId,
        item_name: planId === "power" ? "Power Plan" : "Pro Plan",
        price: amount,
        quantity: 1,
      },
    ],
  });
}
