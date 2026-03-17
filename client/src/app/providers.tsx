"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { GoogleOAuthProvider, useGoogleOneTapLogin } from "@react-oauth/google";
import axios from "axios";
import api from "@/config/api";
import { Toaster, toast } from "sonner";
import UserTracker from "@/components/UserTracker";
import { cn } from "@/lib/utils";

// ── BackgroundBeams is only needed on marketing pages, never on /notes, /admin, etc.
// Lazy import so it doesn't land in the initial JS bundle at all.
import dynamic from "next/dynamic";
const BackgroundBeams = dynamic(
  () => import("@/components/ui/background-beams").then((m) => ({ default: m.BackgroundBeams })),
  { ssr: false, loading: () => null }
);

/** Pages that should show the decorative background beams */
const BEAMS_PAGES = ["/", "/pricing", "/about", "/models", "/explore", "/tools", "/games", "/blog", "/success-stories"];

export function Providers({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const pathname = usePathname();
  const streakCalled = useRef(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Pages where desktop nav should be hidden
  const hideDesktopNav = ["/admin", "/notes/", "/note/"].some(
    (path) => pathname?.startsWith(path)
  );

  // Pages where mobile bottom dock should be hidden
  const hideMobileNav = ["/admin", "/sentinel", "/notes/", "/note/"].some(
    (path) => pathname?.startsWith(path)
  );

  // Only show beams on marketing pages — not on heavy editor/note pages
  const showBeams = BEAMS_PAGES.some(
    (p) => pathname === p || pathname?.startsWith(p + "/") === false && pathname?.startsWith(p)
  );

  // Sync auth state from localStorage
  useEffect(() => {
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
    return () => window.removeEventListener("auth-change", syncAuthState);
  }, []);

  // Defer streak update — use requestIdleCallback so it never blocks UI
  useEffect(() => {
    if (streakCalled.current) return;
    streakCalled.current = true;

    const updateStreak = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        await api.post(
          "/users/update-streak",
          {},
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );
      } catch (err) {
        // Non-critical — silent fail
      }
    };

    // Use idle callback so we never block the main thread during page load
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => updateStreak(), { timeout: 5000 });
    } else {
      setTimeout(updateStreak, 2000);
    }
  }, []);

  const handleLoginSuccess = async (
    googleAccessToken: string,
    userInfo: any,
    backendResponse?: any
  ) => {
    try {
      setAuthLoading(true);
      if (backendResponse?.success && backendResponse?.data) {
        const { token, user: backendUser } = backendResponse.data;
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(backendUser));
        setUser(backendUser);
        setIsLoggedIn(true);
        toast.success(`Welcome, ${backendUser.name}!`);
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

      {/* Background beams — only on marketing pages, lazily loaded */}
      {showBeams && (
        <div
          className="fixed inset-0 -z-10 opacity-20 pointer-events-none"
          aria-hidden="true"
        >
          <BackgroundBeams />
        </div>
      )}

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
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          !hideDesktopNav ? "lg:mt-20" : "mt-0",
          !hideMobileNav ? "pb-20 lg:pb-0" : "pb-0"
        )}
      >
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