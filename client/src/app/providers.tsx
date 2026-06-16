"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { GoogleOAuthProvider, useGoogleOneTapLogin } from "@react-oauth/google";
import axios from "axios";
import api from "@/config/api";
import { Toaster, toast } from "sonner";
import UserTracker from "@/components/UserTracker";
import { cn } from "@/lib/utils";
import { LoginDialog } from "@/components/LoginDialog";
import { trackSignup } from "@/utils/analytics";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const pathname = usePathname();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = !!(clientId && clientId !== "YOUR_GOOGLE_CLIENT_ID" && clientId !== "");
  const disableOneTap = process.env.NEXT_PUBLIC_DISABLE_GOOGLE_ONE_TAP === "true";

  // --- GRANULAR VISIBILITY MAP ---
  // Hide Desktop Nav on high-focus tools or admin pages
  const hideDesktopNav = [
    "/admin", 
    "/notes/", 
    "/note/",
    "/flashcards/",
    "/presentation-generator/"
  ].some(path => pathname?.startsWith(path));

  // Hide Mobile Bottom Dock on tools that require full-screen height
  const hideMobileNav = [
    "/admin",
    "/sentinel",
    "/notes/",
    "/note/",
    "/flashcards/"
  ].some(path => pathname?.startsWith(path));


  useEffect(() => {
    setMounted(true);
    const syncAuthState = () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        setIsLoggedIn(true);
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    syncAuthState();
    window.addEventListener("auth-change", syncAuthState);
    
    const handleOpenLogin = () => setIsLoginOpen(true);
    window.addEventListener("open-login", handleOpenLogin);

    return () => {
      window.removeEventListener("auth-change", syncAuthState);
      window.removeEventListener("open-login", handleOpenLogin);
    };
  }, []);

  useEffect(() => {
    const updateStreakAndProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        // 1. Update the study streak on the backend
        await api.post(
          "/users/update-streak",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        // 2. Fetch the fresh user profile containing the updated streak & details
        const profileResponse = await api.get("/auth/get-profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (profileResponse.data?.success && profileResponse.data?.user) {
          const freshUser = profileResponse.data.user;
          localStorage.setItem("user", JSON.stringify(freshUser));
          setUser(freshUser);
        }
      } catch (err) {
        console.log("Failed to sync study streak and user profile:", err);
      }
    };

    updateStreakAndProfile();
  }, []);

  

  const handleLoginSuccess = async (googleAccessToken: string, userInfo: any, backendResponse?: any) => {
    try {
      setAuthLoading(true);
      if (backendResponse?.success && backendResponse?.data) {
        const { token, user: backendUser } = backendResponse.data;

        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(backendUser));

        setUser(backendUser);
        setIsLoggedIn(true);
        toast.success(`Welcome, ${backendUser.name}!`);
        
        // Full website reload to rehydrate data but stay on the current route
        window.location.reload();
      }
    } catch {
      toast.error("Auth Handshake Failed");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId || ""}>
      <Toaster theme="dark" position="top-center" richColors />
      
      {mounted && isGoogleConfigured && !disableOneTap && <GoogleOneTapLoginWrapper onSuccess={handleLoginSuccess} />}

      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />

      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginSuccess={handleLoginSuccess}
        authLoading={authLoading}
        hideDesktop={hideDesktopNav}
        hideMobile={hideMobileNav}
      />

      {/* Main Content Wrapper with Adaptive Padding */}
      <main className={cn(
        "flex-1 transition-all duration-500",
        !hideDesktopNav ? "lg:mt-20" : "mt-0",
        !hideMobileNav ? "pb-20 lg:pb-0" : "pb-0"
      )}>
        {children}
      </main>

      <UserTracker />
    </GoogleOAuthProvider>
  );
}

function GoogleOneTapLoginWrapper({ onSuccess }: any) {
  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      try {
        const idToken = credentialResponse.credential!;
        const { data: userInfo } = await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
        );
        const response = await api.post("/auth/google", {
          googleAccessToken: idToken,
          authType: "id_token",
        });
        if (response.data.success && response.data.data) {
          const { isSignup } = response.data.data;
          if (isSignup) {
            trackSignup("google_onetap");
          }
        }
        onSuccess(idToken, userInfo, response.data);
      } catch (error) {
        console.error("One Tap Login Error:", error);
      }
    },
  });
  return null;
}