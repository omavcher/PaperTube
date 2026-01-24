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

      // 2. Determine Traffic Source
      const referrer = document.referrer;
      let source = "Direct";

      if (referrer.includes("instagram.com") || window.location.search.includes("utm_source=instagram"))
        source = "Instagram";
      else if (referrer.includes("t.co") || referrer.includes("twitter.com") || window.location.search.includes("utm_source=twitter"))
        source = "Twitter/X";
      else if (referrer.includes("whatsapp.com") || window.location.search.includes("utm_source=whatsapp"))
        source = "WhatsApp";
      else if (referrer.includes("facebook.com") || window.location.search.includes("utm_source=facebook"))
        source = "Facebook";
      else if (referrer.includes("linkedin.com") || window.location.search.includes("utm_source=linkedin"))
        source = "LinkedIn";
      else if (referrer.includes("youtube.com") || window.location.search.includes("utm_source=youtube"))
        source = "YouTube";
      else if (referrer) {
        try {
          source = new URL(referrer).hostname;
        } catch (error) {
          console.error("Failed to parse referrer URL", error);
        }
      }

      // 3. Prepare Payload
      const payload = {
        isLoggedIn: !!token,
        userId: userData?.id || null,
        email: userData?.email || null,
        source: source,
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