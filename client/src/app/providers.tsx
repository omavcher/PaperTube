"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { GoogleOAuthProvider, useGoogleOneTapLogin } from "@react-oauth/google";
import axios from "axios";
import api from "@/config/api";
import { Toaster, toast } from "sonner";
import UserTracker from "@/components/UserTracker";
import { cn } from "@/lib/utils";

export function Providers({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const pathname = usePathname();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // --- GRANULAR VISIBILITY MAP ---
  // Hide Desktop Nav on high-focus tools or admin pages
  const hideDesktopNav = [
    "/admin", 
    "/notes/", 
    "/note/"
  ].some(path => pathname?.startsWith(path));

  // Hide Mobile Bottom Dock on tools that require full-screen height
  const hideMobileNav = [
    "/admin", 
    "/sentinel",
    "/notes/",
    "/note/"
  ].some(path => pathname?.startsWith(path));

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

   useEffect(() => {
  const updateStreak = async () => {
    try {
      const token = localStorage.getItem("authToken");

      await api.post(
        "/users/update-streak",
        {}, // 👈 no body needed
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
    } catch (err) {
      console.log("Streak error", err);
    }
  };

  updateStreak();
}, []);

  

  const handleLoginSuccess = async (googleAccessToken: string, userInfo: any, backendResponse?: any) => {
    try {
      setAuthLoading(true);
      if (backendResponse?.success) {
        const { token, user: backendUser, googleAccessToken: gToken, expiresIn } = backendResponse.data;

        localStorage.setItem("authToken", token);
        localStorage.setItem("googleAccessToken", gToken);
        localStorage.setItem("user", JSON.stringify(backendUser));
        localStorage.setItem("expiresIn", expiresIn.toString());

        setUser(backendUser);
        setIsLoggedIn(true);
        toast.success(`Identity Verified: ${backendUser.name}`);
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
      
      {/* Matrix Background */}
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <BackgroundBeams />
      </div>

      <GoogleOneTapLoginWrapper onSuccess={handleLoginSuccess} />

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
        onSuccess(idToken, userInfo, response.data);
      } catch (error) {
        console.error("One Tap Login Error:", error);
      }
    },
  });
  return null;
}