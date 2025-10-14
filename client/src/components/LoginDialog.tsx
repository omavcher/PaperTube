// components/LoginDialog.tsx
"use client";

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

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any, token: string) => void;
}

export function LoginDialog({ isOpen, onClose, onSuccess }: LoginDialogProps) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;

        // Get user info from Google
        const { data } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        // Send user to backend to create/save session
        const response = await api.post("/auth/google", {
          name: data.name,
          email: data.email,
          picture: data.picture,
        });

        const sessionToken = response.data.sessionToken;

        // Save user in localStorage
        localStorage.setItem("authToken", sessionToken);
        localStorage.setItem("user", JSON.stringify(data));

        // Trigger success callback
        onSuccess(data, sessionToken);

        // Close dialog and redirect
        onClose();
        window.location.href = "/";
      } catch (err) {
        console.error("Google login error:", err);
      }
    },
    onError: (err) => console.error("Login Failed:", err),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            className="flex items-center gap-3 px-6 py-3 text-base font-medium bg-white text-black rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100 transition cursor-pointer w-full justify-center"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}