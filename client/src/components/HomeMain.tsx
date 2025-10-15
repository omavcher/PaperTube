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

export default function HomeMain() {
  const [description, setDescription] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaderLoading, setLoaderLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note. Please try again.');
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
      
      {/* MultiStep Loader */}
      <Loader loadingStates={loadingStates} loading={loaderLoading} duration={2000} />
      
      {loaderLoading && (
        <button
          className="fixed top-4 right-4 text-white z-[120]"
          onClick={() => setLoaderLoading(false)}
        >
          <IconSquareRoundedX className="h-10 w-10" />
        </button>
      )}

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          Build Something <Cover> <span className="text-red-500">Lovable</span></Cover> 
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Create apps and websites by chatting with AI
        </p>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-1 bg-gradient-to-r from-black-500/10 to-black-700/5 backdrop-blur-sm">
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-md border border-white/10 shadow-2xl">
              <input
                type="text"
                placeholder="Describe your idea or paste a YouTube URL..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-400 text-lg border-none outline-none p-3 mb-6"
              />
              
              <div className="flex items-center justify-between gap-4">
                {loading && (
                  <div className="mb-6 p-4 w-[60%] bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading video info...</div>
                  </div>
                )}
                
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 rounded-lg">
                    <p className="text-red-300">{error}</p>
                  </div>
                )}
                
                {videoInfo && !loading && (
                  <div className="mb-6 p-4 w-[70%] bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start space-x-4">
                      {videoInfo.thumbnail && (
                        <Image 
                          src={videoInfo.thumbnail} 
                          alt="Video thumbnail" 
                          width={96}
                          height={64}
                          className="w-24 h-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1 text-left">
                        <h3 className="text-white font-medium mb-1">YouTube Video</h3>
                        <p className="text-gray-300 text-sm">{videoInfo.title}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleClick}
                  className="px-8 border-none py-3 rounded-xl font-medium text-white 
                           bg-gradient-to-r from-[#fb2d37]/90 to-[#fb2d37] 
                           hover:from-[#e1252f] hover:to-[#c91f28] 
                           transition-all duration-300 shadow-lg 
                           hover:shadow-[#fb2d37]/30 backdrop-blur-sm"
                >
                  Create Now
                </Button>
              </div>

              {/* Authentication status indicator */}
              {!isAuthenticated && (
                <div className="mt-4 text-center">
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