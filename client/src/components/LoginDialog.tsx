// components/LoginDialog.tsx
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
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import api from "@/config/api";

// Interface for user data
interface UserData {
  name?: string;
  email?: string;
  picture?: string;
  googleAccessToken?: string;
}

// Interface for backend response
interface BackendResponse {
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
        
        // More detailed error logging
        if (err.response) {
          console.error("Response error:", err.response.data);
          console.error("Response status:", err.response.status);
        }
        
        // User-friendly error message
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
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Login Required
          </DialogTitle>
          <DialogDescription className="text-center text-neutral-400">
            You need to login before creating PDFs
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <div className="text-sm text-neutral-300 text-center mb-4">
            Please login with Google to access PDF creation features
          </div>
          
          <button
            onClick={() => login()}
            disabled={authLoading || loading}
            className="flex items-center gap-3 px-6 py-3 text-base font-medium bg-white text-black rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
          >
            {authLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-gray-600 animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <FcGoogle className="text-xl" />
                Continue with Google
              </>
            )}
          </button>
          
          <button
            onClick={handleClose}
            disabled={authLoading || loading}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition disabled:opacity-50"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}