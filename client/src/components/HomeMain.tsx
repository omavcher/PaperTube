"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BackgroundBeams } from './ui/background-beams';
import { Button } from './ui/stateful-button';
import api from '@/config/api';
import { MultiStepLoader as Loader } from "./ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
import { useRouter } from 'next/navigation';
import { Cover } from './ui/cover';
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
import Image from 'next/image';

const loadingStates = [
  { text: "Analyzing your YouTube video" },
  { text: "Extracting key concepts" },
  { text: "Generating content outline" },
  { text: "Creating learning materials" },
  { text: "Finalizing your notes" },
  { text: "Almost ready..." },
];

// Interfaces
interface UserData {
  name: string;
  email: string;
  picture?: string;
}

interface VideoInfo {
  thumbnail?: string;
  title: string;
}

interface ApiErrorResponse {
  success: boolean;
  code: string;
  message: string;
  retryAfter?: string;
}

// Login Dialog Component
function LoginDialog({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: (userData: UserData, token: string) => void;
}) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;

        // Get user info from Google
        const { data } = await axios.get<UserData>(
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
      } catch (err) {
        console.error("Google login error:", err);
      }
    },
    onError: (err) => console.error("Login Failed:", err),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-700 text-white animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader>
          <DialogTitle className="text-center text-xl animate-in fade-in-0 slide-in-from-top-3 duration-500">
            Login Required
          </DialogTitle>
          <DialogDescription className="text-center text-neutral-400 animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-100">
            You need to login before creating PDFs
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4 space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
          <div className="text-sm text-neutral-300 text-center mb-4">
            Please login with Google to access PDF creation features
          </div>
          
          <button
            onClick={() => login()}
            className="flex items-center gap-3 px-6 py-3 text-base font-medium bg-white text-black rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer w-full justify-center transform-gpu"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Server Busy Dialog Component
function ServerBusyDialog({ 
  isOpen, 
  onClose, 
  retryAfter 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  retryAfter?: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-700 text-white animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader>
          <DialogTitle className="text-center text-xl animate-in fade-in-0 slide-in-from-top-3 duration-500 text-yellow-500">
            Servers Are Busy
          </DialogTitle>
          <DialogDescription className="text-center text-neutral-400 animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-100">
            We're experiencing high traffic right now
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4 space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
          <div className="text-sm text-neutral-300 text-center mb-4">
            Our servers are currently processing many requests. Please try again in {retryAfter || 'a few minutes'}.
          </div>
          
          <div className="flex items-center justify-center gap-2 text-yellow-500 mb-4">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce delay-300"></div>
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-3 text-base font-medium bg-yellow-500/20 text-yellow-300 rounded-xl border border-yellow-500/30 hover:bg-yellow-500/30 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer w-full justify-center transform-gpu"
          >
            Got it, I'll try later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function HomeMain() {
  const [description, setDescription] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaderLoading, setLoaderLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showServerBusyDialog, setShowServerBusyDialog] = useState(false);
  const [serverBusyRetryAfter, setServerBusyRetryAfter] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  // YouTube URL detection regex - wrapped in useMemo to prevent unnecessary re-renders
  const youtubeRegex = useMemo(() => 
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/, 
    []
  );

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchVideoInfo = useCallback(async () => {
    if (youtubeRegex.test(description)) {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.post<VideoInfo>('/notes/ytinfo', {
          videoUrl: description
        });
        
        setVideoInfo(response.data);
      } catch (err) {
        setError('Failed to fetch video information');
        console.error('Error fetching video info:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Reset video info if it's not a YouTube URL
      setVideoInfo(null);
    }
  }, [description, youtubeRegex]);

  useEffect(() => {
    // Add a delay to avoid making API calls on every keystroke
    const delayDebounceFn = setTimeout(() => {
      if (description.trim()) {
        fetchVideoInfo();
      } else {
        setVideoInfo(null);
      }
    }, 800); // 800ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [description, fetchVideoInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLoginDialog(false);
    // After successful login, trigger the create action
    handleCreateNote();
  };

  const handleCreateNote = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('Please Login');
      return;
    }
    if (!youtubeRegex.test(description)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoaderLoading(true);
    setError(null);

    try {
      // Call the API to create a new note
      const response = await api.post('/notes/', {
        videoUrl: description
      }, {
        headers: {
          'Auth': authToken
        }
      });

      // If successful, redirect to the note's slug page
      if (response.data && response.data.newNote && response.data.newNote.slug) {
        router.push(`/notes/${response.data.newNote.slug}`);
      }
    } catch (err: any) {
      console.error('Error creating note:', err);
      
      // Handle SERVER_BUSY error specifically
      if (err.response?.data?.code === 'SERVER_BUSY') {
        const errorData: ApiErrorResponse = err.response.data;
        setServerBusyRetryAfter(errorData.retryAfter || 'a few minutes');
        setShowServerBusyDialog(true);
        setError('Servers are busy. Please try again later.');
      } else {
        setError('Failed to create note. Please try again.');
      }
      
      setLoaderLoading(false);
    }
  };

  const handleClick = () => {
    // Check if user is authenticated
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      // Show login dialog if not authenticated
      setShowLoginDialog(true);
      return;
    }

    // If authenticated, proceed with note creation
    handleCreateNote();
  };

  return (
    <section className="w-full min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-black px-4 py-12">
      {/* Login Dialog */}
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onSuccess={() => handleLoginSuccess()}
      />
      
      {/* Server Busy Dialog */}
      <ServerBusyDialog
        isOpen={showServerBusyDialog}
        onClose={() => setShowServerBusyDialog(false)}
        retryAfter={serverBusyRetryAfter}
      />
      
      {/* MultiStep Loader */}
      <Loader loadingStates={loadingStates} loading={loaderLoading} duration={2000} />
      
      {loaderLoading && (
        <button
          className="fixed top-4 right-4 text-white z-[120] hover:scale-110 active:scale-95 transition-transform duration-300"
          onClick={() => setLoaderLoading(false)}
        >
          <IconSquareRoundedX className="h-10 w-10" />
        </button>
      )}

      <div className="relative z-10 max-w-4xl mx-auto text-center animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight animate-in fade-in-0 slide-in-from-top-12 duration-700">
          Turn Any <Cover> <span className="text-red-500 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">YouTube</span> </Cover> Lecture into Beautiful Notes
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in-0 slide-in-from-top-12 duration-700 delay-200">
          Paste a YouTube link and get a smart, timestamped PDF with key topics — instantly generated by AI.
        </p>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-300">
          <div className={`rounded-2xl p-1 bg-gradient-to-r from-black-500/10 to-black-700/5 backdrop-blur-sm transition-all duration-500 ${
            isFocused ? 'ring-2 ring-white/20 scale-[1.02]' : 'scale-100'
          }`}>
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-500">
              <input
                type="text"
                placeholder="Paste YouTube URL"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-transparent text-white placeholder-gray-400 text-lg border-none outline-none p-3 mb-6 transition-all duration-300"
              />
              
              <div className="flex flex-col items-center justify-between gap-4">
                {loading && (
                  <div className="mb-6 p-4 w-[60%] bg-white/5 rounded-xl border border-white/10 flex items-center justify-center animate-in fade-in-0 zoom-in-95 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-300"></div>
                      <span className="text-gray-400 ml-2">Loading video info...</span>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className={`mb-4 p-4 rounded-xl border animate-in fade-in-0 slide-in-from-top-4 duration-500 ${
                    error.includes('Servers are busy') 
                      ? 'bg-yellow-500/10 border-yellow-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <p className={error.includes('Servers are busy') ? 'text-yellow-300' : 'text-red-300'}>
                      {error}
                    </p>
                    {error.includes('Servers are busy') && (
                      <p className="text-yellow-400/80 text-sm mt-2">
                        We're working on scaling our servers to handle the load. Thank you for your patience!
                      </p>
                    )}
                  </div>
                )}
                
                {videoInfo && !loading && (
                  <div className="mb-6 p-4 w-full bg-white/5 rounded-xl border border-white/10 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                      {videoInfo.thumbnail && (
                        <div className="relative overflow-hidden rounded-lg transform-gpu transition-transform duration-300 hover:scale-105">
                          <Image 
                            src={videoInfo.thumbnail} 
                            alt="Video thumbnail" 
                            width={96}
                            height={64}
                            className="w-24 h-16 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-gray-300 text-sm line-clamp-2">{videoInfo.title}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleClick}
                  className="px-8 border-none py-4 rounded-xl font-medium text-white 
                           bg-gradient-to-r from-[#fb2d37]/90 to-[#fb2d37] 
                           hover:from-[#e1252f] hover:to-[#c91f28] 
                           transition-all duration-300 shadow-lg 
                           hover:shadow-[#fb2d37]/30 hover:scale-105 
                           active:scale-95 backdrop-blur-sm transform-gpu
                           animate-in fade-in-0 zoom-in-95 duration-500 delay-500"
                >
                  Create Now
                </Button>
              </div>

              {/* Mini Tagline */}
              <div className="mt-4 text-center animate-in fade-in-0 duration-700 delay-700">
                <p className="text-sm text-gray-400 italic">
                  Your lectures, reimagined as stunning study notes.
                </p>
              </div>

              {/* Authentication status indicator */}
              {!isAuthenticated && (
                <div className="mt-4 text-center animate-in fade-in-0 duration-700 delay-800">
                  <p className="text-sm text-gray-400">
                    You&apos;ll need to login to create PDFs
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
      <BackgroundBeams />
    </section>
  );
}