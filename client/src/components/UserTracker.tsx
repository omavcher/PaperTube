"use client";
import api from "@/config/api";
import { useEffect, useState } from "react";

const UserTracker = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    setToken(localStorage.getItem("authToken"));
  }, []);

  // Fetch and store user profile if token exists
  useEffect(() => {
    if (!isClient || !token) return;

    const Userdatasave = async () => {
      try {
        const response = await api.get("/auth/get-profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = response.data.user;
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    Userdatasave();
  }, [token, isClient]);

  // Track user analytics
  useEffect(() => {
    if (!isClient) return;

    const trackUser = async () => {
      // 1. Get Auth Data from localStorage
      const userDataRaw = localStorage.getItem("user");
      let userData = null;

      try {
        userData = userDataRaw ? JSON.parse(userDataRaw) : null;
      } catch (error) {
        console.error("Failed to parse user data", error);
      }

      // --- ADMIN EXCLUSION CHECK ---
      // Get admin email from env and check if it matches the current user
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (userData?.email && userData.email === adminEmail) {
        console.log("Admin detected. Skipping analytics tracking.");
        return;
      }
      // -----------------------------

      // 2. Determine Traffic Source and Advanced UTM Tracking
      const referrer = document.referrer;
      
      const urlParams = new URLSearchParams(window.location.search);
      let utmData = {
        utmSource: urlParams.get('utm_source') || null,
        utmMedium: urlParams.get('utm_medium') || null,
        utmCampaign: urlParams.get('utm_campaign') || null,
        utmTerm: urlParams.get('utm_term') || null,
        utmContent: urlParams.get('utm_content') || null,
      };

      // Persist in sessionStorage so multi-page visits retain original UTMs
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

      if (source === "Direct") {
        if (referrer.includes("instagram.com")) source = "Instagram";
        else if (referrer.includes("t.co") || referrer.includes("twitter.com")) source = "Twitter/X";
        else if (referrer.includes("whatsapp.com")) source = "WhatsApp";
        else if (referrer.includes("facebook.com")) source = "Facebook";
        else if (referrer.includes("linkedin.com")) source = "LinkedIn";
        else if (referrer.includes("youtube.com")) source = "YouTube";
        else if (referrer) {
          try {
            source = new URL(referrer).hostname;
          } catch (error) {
            console.error("Failed to parse referrer URL", error);
          }
        }
      }

      // 3. Prepare Payload
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
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: referrer || null,
      };

      // 4. Send to Backend
      try {
        await api.post("/analytics/track", payload);
      } catch (err) {
        console.error("Analytics Error:", err);
      }
    };

    trackUser();
  }, [token, isClient]);

  return null;
};

export default UserTracker;