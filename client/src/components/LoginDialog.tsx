"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import api from "@/config/api";

// Interface for user data
export interface UserData {
  name?: string;
  email?: string;
  picture?: string;
  googleAccessToken?: string;
}

// Interface for backend response
export interface BackendResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    expiresIn: string;
    googleAccessToken?: string;
    user: UserData;
  };
}

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (googleAccessToken: string, userInfo: UserData, backendResponse?: BackendResponse) => void;
  loading?: boolean;
}

export function LoginDialog({ 
  isOpen, 
  onClose, 
  onSuccess,
  loading = false 
}: LoginDialogProps) {
  const [authLoading, setAuthLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setAuthLoading(true);
        console.log("Google OAuth response:", tokenResponse);
        const accessToken = tokenResponse.access_token;

        // Get user info from Google using access token
        const { data: userInfo } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { 
            headers: { 
              Authorization: `Bearer ${accessToken}` 
            } 
          }
        );

        console.log("User info from Google:", userInfo);

        // Send to backend
        try {
          const response = await api.post<BackendResponse>("/auth/google", {
            googleAccessToken: accessToken,
            authType: 'access_token'
          });

          console.log("Backend response:", response.data);

          if (response.data.success) {
            // Call the success handler with backend data
            onSuccess(accessToken, {
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture,
              ...response.data.data?.user
            }, response.data);
            
            // Store tokens and user data
            if (response.data.data) {
              localStorage.setItem("authToken", response.data.data.token);
              localStorage.setItem("user", JSON.stringify({
                ...userInfo,
                ...response.data.data.user
              }));
              localStorage.setItem("googleAccessToken", response.data.data.googleAccessToken || accessToken);
              localStorage.setItem("expiresIn", response.data.data.expiresIn);
            }
          } else {
            // If backend returns success: false but has data, still proceed
            if (response.data.data) {
              onSuccess(accessToken, {
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture,
                ...response.data.data.user
              }, response.data);
              
              localStorage.setItem("authToken", response.data.data.token);
              localStorage.setItem("user", JSON.stringify({
                ...userInfo,
                ...response.data.data.user
              }));
              localStorage.setItem("googleAccessToken", response.data.data.googleAccessToken || accessToken);
              localStorage.setItem("expiresIn", response.data.data.expiresIn);
            } else {
              throw new Error(response.data.message || "Login failed");
            }
          }
        } catch (backendError: any) {
          console.error("Backend API error:", backendError);
          
          // Check if it's a network error or server error
          if (!backendError.response) {
            // Network error - use direct login
            console.log("Network error, using direct login");
            onSuccess(accessToken, {
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture
            });
            
            // Store minimal data
            localStorage.setItem("authToken", `temp_${Date.now()}`);
            localStorage.setItem("user", JSON.stringify(userInfo));
            localStorage.setItem("googleAccessToken", accessToken);
          } else {
            // Server responded with error
            console.error("Backend error response:", backendError.response.data);
            
            // Try to parse error message
            const errorMsg = backendError.response.data?.message || 
                           backendError.response.data?.error || 
                           "Backend authentication failed";
            
            // Still allow login with Google data for non-401 errors
            if (backendError.response.status !== 401) {
              onSuccess(accessToken, {
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture
              });
              
              localStorage.setItem("authToken", `temp_${Date.now()}`);
              localStorage.setItem("user", JSON.stringify(userInfo));
              localStorage.setItem("googleAccessToken", accessToken);
            } else {
              alert(`${errorMsg}. Please try again.`);
            }
          }
        }
        
        // Close dialog
        onClose();
        
        // Redirect to home page
        window.location.href = "/";
        
      } catch (err: any) {
        console.error("Google login error details:", err);
        let errorMessage = "Login failed. Please try again.";
        
        if (err.message.includes("Network Error")) {
          errorMessage = "Cannot connect to server. Please check your internet connection.";
        } else if (err.message.includes("timeout")) {
          errorMessage = "Request timeout. Please try again.";
        } else if (err.response?.status === 401) {
          errorMessage = "Authentication failed. Please check your credentials.";
        } else if (err.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
        
        alert(errorMessage);
      } finally {
        setAuthLoading(false);
      }
    },
    onError: (err) => {
      console.error("Google OAuth error:", err);
      alert("Google authentication failed. Please try again.");
      setAuthLoading(false);
    },
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file',
    flow: 'implicit',
  });

  const handleClose = () => {
    if (!authLoading && !loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-md bg-neutral-900/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl p-0 gap-0 overflow-hidden rounded-3xl">
        {/* Decorative Header Background */}
        <div className="relative h-32 w-full bg-gradient-to-b from-zinc-800/50 to-neutral-900/50 flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
           <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-xl z-10">
              <Lock className="w-8 h-8 text-white/80" />
           </div>
        </div>

        <div className="p-8 pt-6">
            <DialogHeader className="mb-6 space-y-3">
            <DialogTitle className="text-center text-2xl font-bold tracking-tight text-white">
                Welcome Back
            </DialogTitle>
            <DialogDescription className="text-center text-neutral-400 text-base">
                Sign in to save your progress, create unlimited notes, and access premium features.
            </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center space-y-4">
            <button
                onClick={() => login()}
                disabled={authLoading || loading}
                className="group relative flex items-center justify-center gap-3 px-6 py-4 w-full bg-white text-black rounded-xl font-semibold text-lg hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                {authLoading ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin text-black" />
                    <span className="text-base">Connecting...</span>
                </>
                ) : (
                <>
                    <FcGoogle className="text-2xl shrink-0" />
                    <span>Continue with Google</span>
                </>
                )}
            </button>
            
            <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-2">
                <ShieldCheck className="w-3 h-3" />
                <span>Secure Authentication powered by Google</span>
            </div>

            <div className="w-full flex items-center gap-4 my-2">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">or</span>
                <div className="h-px bg-white/10 flex-1" />
            </div>
            
            <button
                onClick={handleClose}
                disabled={authLoading || loading}
                className="text-sm text-neutral-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5"
            >
                Continue as Guest
            </button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}