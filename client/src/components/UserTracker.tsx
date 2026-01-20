"use client";
import api from "@/config/api";
import { e } from "mathjs";
import { useEffect } from "react";

const UserTracker = () => {
  useEffect(() => {
    const trackUser = async () => {
      // 1. Get Auth Data from localStorage
      const token = localStorage.getItem("authToken");
      const userDataRaw = localStorage.getItem("user");
      let userData = null;

      try {
        userData = userDataRaw ? JSON.parse(userDataRaw) : null;
      } catch (e) {
        console.error("Failed to parse user data");
      }

      // --- ADMIN EXCLUSION CHECK ---
      // Get admin email from env and check if it matches the current user
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (userData?.email && userData.email === adminEmail) {
        console.log("Admin detected. Skipping analytics tracking.");
        return; 
      }
      // -----------------------------

      // 2. Determine Traffic Source
      const referrer = document.referrer;
      let source = "Direct";

      if (referrer.includes("instagram.com") || window.location.search.includes("utm_source=instagram")) source = "Instagram";
      else if (referrer.includes("t.co") || referrer.includes("twitter.com") || window.location.search.includes("utm_source=twitter")) source = "Twitter/X";
      else if (referrer.includes("whatsapp.com") || window.location.search.includes("utm_source=whatsapp")) source = "WhatsApp";
      else if (referrer.includes("facebook.com") || window.location.search.includes("utm_source=facebook")) source = "Facebook";
      else if (referrer.includes("linkedin.com") || window.location.search.includes("utm_source=linkedin")) source = "LinkedIn";
      else if (referrer.includes("youtube.com") || window.location.search.includes("utm_source=youtube")) source = "YouTube";
      
      else if (referrer) source = new URL(referrer).hostname;

      // 3. Prepare Payload
      const payload = {
        isLoggedIn: !!token,
        userId: userData?.id || null,
        email: userData?.email || null,
        source: source,
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };

      // 4. Send to Backend
      try {
        // Note: With axios (api.post), you usually don't need 'method' or 'body: JSON.stringify'
        await api.post("/analytics/track", payload);
      } catch (err) {
        console.error("Analytics Error:", err);
      }
    };

    trackUser();
  }, []);

  return null; 
};

export default UserTracker;