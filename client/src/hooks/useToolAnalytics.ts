// hooks/useToolAnalytics.ts
"use client";

import { useEffect } from "react";
import api from "@/config/api";

export const useToolAnalytics = (toolId: string, toolName: string, category: string) => {
  useEffect(() => {
    const trackView = async () => {
      try {
        // --- 1. Admin Exclusion Logic ---
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            // If current user is the admin, DO NOT track
            if (user.email === "omawchar07@gmail.com") {
              console.log("Admin detected. Analytics disabled.");
              return; 
            }
          } catch (e) {
            // Ignore parse errors and continue tracking
          }
        }

        // --- 2. Determine Traffic Source ---
        let source = "direct";
        if (document.referrer) {
          if (document.referrer.includes(window.location.hostname)) {
            source = "internal_navigation";
          } else if (document.referrer.includes("google")) {
            source = "organic_search";
          } else if (document.referrer.includes("t.co") || document.referrer.includes("twitter")) {
            source = "social_twitter";
          } else if (document.referrer.includes("linkedin")) {
            source = "social_linkedin";
          } else {
            source = "external_referral";
          }
        }

        // --- 3. Fire Tracking Request ---
        await api.post("/analytics/track-tools", {
          toolId,
          toolName,
          category,
          eventType: "view", 
          source,
          path: window.location.pathname
        });
        
      } catch (error) {
        // Silently fail so user experience isn't affected
        console.error("Analytics Error:", error);
      }
    };

    trackView();
  }, [toolId, toolName, category]); // Runs once when the component mounts
};