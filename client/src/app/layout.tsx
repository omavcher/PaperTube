"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { GoogleOAuthProvider, useGoogleOneTapLogin } from "@react-oauth/google";
import axios from "axios";
import api from "@/config/api";
import { Toaster, toast } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const pathname = usePathname();

  const isNotesPage = pathname?.startsWith('/notes/') || pathname?.startsWith('/admin/');

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
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
        toast.success(`Identity Verified: Welcome ${backendUser.name}`);
      }
    } catch (error) {
      toast.error("Neural Link Failed");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={`${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`}>
      <Toaster theme="dark" position="top-center" />
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <BackgroundBeams />
      </div>
      <GoogleOneTapLoginWrapper onSuccess={handleLoginSuccess} />
      {!isNotesPage && (
        <Navbar 
          isLoggedIn={isLoggedIn} 
          user={user} 
          onLoginSuccess={handleLoginSuccess}
          authLoading={authLoading}
        />
      )}
      <main className={`flex-1 relative z-10 ${isNotesPage ? 'mt-0' : 'mt-0 md:mt-20'}`}>
        {children}
      </main>
    </GoogleOAuthProvider>
  );
}

function GoogleOneTapLoginWrapper({ onSuccess }: any) {
  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      const idToken = credentialResponse.credential;
      const { data: userInfo } = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      const response = await api.post("/auth/google", { googleAccessToken: idToken, authType: 'id_token' });
      onSuccess(idToken, userInfo, response.data);
    },
    disabled: false,
  });
  return null;
}