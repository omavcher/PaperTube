"use client";

import "./globals.css";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { GoogleOAuthProvider, useGoogleOneTapLogin } from "@react-oauth/google";
import axios from "axios";
import api from "@/config/api";
import { LoaderX } from "@/components/LoaderX";
import { Toaster, toast } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const pathname = usePathname();

  const isNotesPage = pathname?.startsWith('/notes/') || pathname?.startsWith('/admin/');

  // --- Neural Handshake: Load Session ---
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // --- Logic: Handle API Response & Storage ---
  const handleLoginSuccess = async (googleAccessToken: string, userInfo: any, backendResponse?: any) => {
    try {
      setAuthLoading(true);
      
      if (backendResponse?.success) {
        const { token, user: backendUser, googleAccessToken: gToken, expiresIn } = backendResponse.data;

        // Save exactly as required
        localStorage.setItem("authToken", token);
        localStorage.setItem("googleAccessToken", gToken);
        localStorage.setItem("user", JSON.stringify(backendUser));
        localStorage.setItem("expiresIn", expiresIn.toString());

        setUser(backendUser);
        setIsLoggedIn(true);
        toast.success(`Identity Verified: Welcome ${backendUser.name}`);
      }
    } catch (error) {
      console.error("Auth Error:", error);
      toast.error("Neural Link Failed");
    } finally {
      setAuthLoading(false);
    }
  };

  if (!mounted) return (
    <html lang="en" className="bg-black">
      <body className="bg-black"><LoaderX /></body>
    </html>
  );

  return (
    <GoogleOAuthProvider clientId={`${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`}>
      <html lang="en" className="scroll-smooth bg-black text-white selection:bg-red-500/30">
        <head>
          <title>PaperTube | The Engineer's Workbench</title>
          <link rel="icon" href="/papertube.ico" />
        </head>
        <body className="antialiased bg-[#000000] min-h-screen flex flex-col">
          <Toaster theme="dark" position="top-center" />
          
          <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
            <BackgroundBeams />
          </div>

          <GoogleOneTapLoginWrapper onSuccess={handleLoginSuccess} />

          {/* Unified Navbar handles Home, Tools, and Auth */}
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
        </body>
      </html>
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