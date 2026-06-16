// client/src/utils/analytics.ts
import api from "@/config/api";

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

/**
 * Send telemetry event data directly to our database analytics logs
 */
export async function trackDbActivity(path: string) {
  if (typeof window === "undefined") return;
  try {
    const userDataRaw = localStorage.getItem("user");
    let userData = null;
    try {
      userData = userDataRaw ? JSON.parse(userDataRaw) : null;
    } catch (error) {
      console.error("Failed to parse user data", error);
    }

    // --- ADMIN EXCLUSION CHECK ---
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (userData?.email && userData.email === adminEmail) {
      console.log("Admin detected. Skipping DB analytics tracking.");
      return;
    }

    const token = localStorage.getItem("authToken");
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    
    let utmData = {
      utmSource: urlParams.get('utm_source') || null,
      utmMedium: urlParams.get('utm_medium') || null,
      utmCampaign: urlParams.get('utm_campaign') || null,
      utmTerm: urlParams.get('utm_term') || null,
      utmContent: urlParams.get('utm_content') || null,
    };

    // Restore from session storage if needed
    const storedUtm = sessionStorage.getItem('yt2pdf_utm_data');
    if (storedUtm) {
      try {
        const parsedUtm = JSON.parse(storedUtm);
        utmData.utmSource = utmData.utmSource || parsedUtm.utmSource;
        utmData.utmMedium = utmData.utmMedium || parsedUtm.utmMedium;
        utmData.utmCampaign = utmData.utmCampaign || parsedUtm.utmCampaign;
        utmData.utmTerm = utmData.utmTerm || parsedUtm.utmTerm;
        utmData.utmContent = utmData.utmContent || parsedUtm.utmContent;
      } catch (e) {
        console.error("Failed to parse stored UTM data", e);
      }
    }
    
    if (utmData.utmSource || utmData.utmMedium || utmData.utmCampaign || utmData.utmTerm || utmData.utmContent) {
      sessionStorage.setItem('yt2pdf_utm_data', JSON.stringify(utmData));
    }

    let source = utmData.utmSource || "Direct";
    if (source === "Direct" && referrer) {
      if (referrer.includes("instagram.com")) source = "Instagram";
      else if (referrer.includes("t.co") || referrer.includes("twitter.com")) source = "Twitter/X";
      else if (referrer.includes("whatsapp.com")) source = "WhatsApp";
      else if (referrer.includes("facebook.com")) source = "Facebook";
      else if (referrer.includes("linkedin.com")) source = "LinkedIn";
      else if (referrer.includes("youtube.com")) source = "YouTube";
      else {
        try {
          source = new URL(referrer).hostname;
        } catch (error) {
          console.error("Failed to parse referrer URL", error);
        }
      }
    }

    const payload = {
      isLoggedIn: !!token,
      userId: userData?.id || null,
      email: userData?.email || null,
      source: source,
      utmSource: utmData.utmSource,
      utmMedium: utmData.utmMedium,
      utmCampaign: utmData.utmCampaign,
      utmTerm: utmData.utmTerm,
      utmContent: utmData.utmContent,
      path: path,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: referrer || null,
    };

    await api.post("/analytics/track", payload);
  } catch (err) {
    console.error("Telemetry Error logging to DB:", err);
  }
}

